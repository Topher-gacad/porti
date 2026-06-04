<?php

namespace App\Http\Controllers;

use App\Core\Tenancy\CompanyScope;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\UserRoleAssignment;
use App\Services\RoleAssignmentGuard;
use App\Services\TenantAccess;
use App\Services\UserCompanyTransfer;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Symfony\Component\HttpFoundation\Response;

class UserController extends Controller
{
    public function __construct(
        private readonly TenantAccess $tenant,
        private readonly RoleAssignmentGuard $roleGuard,
        private readonly UserCompanyTransfer $companyTransfer,
    ) {}

    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', User::class);

        $perPage = min((int) request()->integer('per_page', 20), 500);

        return UserResource::collection(
            User::with('roles', 'roleAssignments.role')->paginate($perPage)
        );
    }

    /**
     * The Unassigned review queue: users a JIT SSO login could not resolve to any company
     * (company_id IS NULL). Triaging cross-company strangers is a privileged action, so the
     * queue is super-admin/developer only; they assign a company via the normal update.
     */
    public function unassigned(): AnonymousResourceCollection
    {
        abort_unless($this->tenant->isPrivileged(auth()->user()), Response::HTTP_FORBIDDEN);

        $perPage = min((int) request()->integer('per_page', 20), 500);

        return UserResource::collection(
            User::withoutGlobalScope(CompanyScope::class)
                ->whereNull('company_id')
                ->with('roles', 'roleAssignments.role')
                ->orderBy('created_at')
                ->paginate($perPage)
        );
    }

    public function store(StoreUserRequest $request): UserResource
    {
        $this->authorize('create', User::class);

        $data = $request->validated();

        // A tenant admin may only create users within their own company/branch/department.
        $this->tenant->assertTenantAssignment(auth()->user(), $data);

        $roles = $data['roles'] ?? null;
        unset($data['roles']);

        // Users created via the API are expected to log in through SSO.
        // A random password satisfies the NOT NULL constraint.
        $data['password'] ??= Str::random(32);

        $user = DB::transaction(function () use ($data, $roles) {
            $user = User::create($data);

            if ($roles !== null) {
                $this->applyRoles($user, $roles);
            }

            return $user;
        });

        return new UserResource($user->load('roleAssignments.role'));
    }

    public function show(User $user): UserResource
    {
        $this->authorize('view', $user);

        // Load flat roles too: a user may hold a role via Spatie (e.g. seeded
        // super-admin) without a scoped UserRoleAssignment row.
        return new UserResource($user->load('roles', 'roleAssignments.role'));
    }

    public function update(UpdateUserRequest $request, User $user): UserResource
    {
        $this->authorize('update', $user);

        $data = $request->validated();

        // Reject moving the user into a company/branch/department the actor cannot access.
        $this->tenant->assertTenantAssignment(auth()->user(), $data, $user);

        $hasRoles = array_key_exists('roles', $data);
        $roles = $data['roles'] ?? [];
        unset($data['roles']);

        if (! isset($data['password'])) {
            unset($data['password']);
        }

        $oldCompanyId = $user->company_id;
        $movingCompany = array_key_exists('company_id', $data)
            && (int) ($data['company_id'] ?? 0) !== (int) ($oldCompanyId ?? 0);

        DB::transaction(function () use ($user, $data, $hasRoles, $roles, $movingCompany, $oldCompanyId) {
            $user->update($data);

            if ($hasRoles) {
                $this->applyRoles($user, $roles);
            }

            // A between-company move revokes the old company's scoped role assignments
            // and invalidates tokens (architecture §8). Runs after role sync so freshly
            // applied new-company roles are preserved.
            if ($movingCompany) {
                $this->companyTransfer->handleMove($user, $oldCompanyId);
            }
        });

        return new UserResource($user->fresh()->load('roleAssignments.role'));
    }

    public function destroy(User $user): Response
    {
        $this->authorize('delete', $user);

        $user->delete();

        return response()->noContent();
    }

    /**
     * Persist a flat role list as company-scoped (or global) UserRoleAssignment records
     * and keep Spatie's flat model in sync so BasePolicy::before() continues to work.
     */
    private function applyRoles(User $user, array $roleNames): void
    {
        $actor = auth()->user();

        $scopeType = $user->company_id
            ? UserRoleAssignment::SCOPE_COMPANY
            : UserRoleAssignment::SCOPE_GLOBAL;
        $scopeId = $user->company_id;

        // Apply the same escalation guards as the dedicated role-assignment endpoint
        // before mutating anything: the actor must be able to grant each role and to
        // grant into this scope (non-admins cannot grant global scope).
        $roles = array_map(fn ($name) => Role::findByName($name, 'web'), $roleNames);
        $this->roleGuard->assertScopeAccess($actor, $scopeType, $scopeId);
        foreach ($roles as $role) {
            $this->roleGuard->assertCanGrantRole($actor, $role);
        }

        // Replace same-scope assignments so the simple form acts as a "sync".
        // Delete per-model (not a bulk query delete) so UserRoleAssignmentObserver
        // fires and each revocation is written to the audit trail.
        $user->roleAssignments()
            ->where('scope_type', $scopeType)
            ->where(function ($q) use ($scopeId) {
                $scopeId
                    ? $q->where('scope_id', $scopeId)
                    : $q->whereNull('scope_id');
            })
            ->get()
            ->each
            ->delete();

        foreach ($roles as $role) {
            $user->roleAssignments()->create([
                'role_id' => $role->id,
                'scope_type' => $scopeType,
                'scope_id' => $scopeId,
                'assigned_by' => $actor->id,
            ]);
        }

        // Rebuild the Spatie flat model from ALL of the user's assignments (not just
        // the scope edited here), so roles held in other scopes are not dropped.
        $user->syncFlatRolesFromAssignments();
    }
}
