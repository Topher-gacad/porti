<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Services\AuditLogger;
use App\Services\ScopedPermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Symfony\Component\HttpFoundation\Response;

class RoleController extends Controller
{
    // These roles bypass all policy checks — never allow modification or deletion
    private const LOCKED_ROLES = ['super-admin', 'developer'];

    // System roles ship with the app; they can't be deleted but permissions can be updated (non-locked ones)
    private const SYSTEM_ROLES = ['super-admin', 'developer', 'company-admin', 'branch-manager', 'manager', 'user', 'viewer'];

    public function __construct(
        private readonly AuditLogger $audit,
        private readonly ScopedPermissionService $sps,
    ) {}

    public function index(): JsonResponse
    {
        $this->requireManageAccess();

        $roles = Role::with('permissions:name')
            ->orderBy('name')
            ->get()
            ->map(fn ($r) => $this->formatRole($r));

        return response()->json(['data' => $roles]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->requireManageAccess();

        $validated = $request->validate([
            'name'          => ['required', 'string', 'max:100', 'unique:roles,name'],
            'permissions'   => ['array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        // Gap 2: prevent adding permissions the actor doesn't hold themselves
        $this->assertPermissionsWithinActorScope($validated['permissions'] ?? []);

        $role = Role::create(['name' => $validated['name'], 'guard_name' => 'web']);
        $role->syncPermissions($validated['permissions'] ?? []);

        $this->audit->log(AuditLog::ACTION_ROLE_CREATED, $role, [
            'name'        => $role->name,
            'permissions' => $validated['permissions'] ?? [],
        ]);

        return response()->json(['data' => $this->formatRole($role->load('permissions:name'))], Response::HTTP_CREATED);
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        $this->requireManageAccess();

        abort_if(in_array($role->name, self::LOCKED_ROLES), 403, 'This role cannot be modified.');

        $validated = $request->validate([
            'name' => [
                'sometimes', 'string', 'max:100',
                Rule::unique('roles', 'name')->ignore($role->id),
                Rule::notIn(self::SYSTEM_ROLES),
            ],
            'permissions'   => ['array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        // Gap 2: prevent escalation — actor cannot assign permissions they don't hold
        if (isset($validated['permissions'])) {
            $this->assertPermissionsWithinActorScope($validated['permissions']);
        }

        $before = $role->permissions->pluck('name')->sort()->values()->toArray();

        if (isset($validated['name']) && !in_array($role->name, self::SYSTEM_ROLES)) {
            $role->update(['name' => $validated['name']]);
        }

        if (isset($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        $after = $role->fresh()->permissions->pluck('name')->sort()->values()->toArray();

        $this->audit->log(AuditLog::ACTION_ROLE_UPDATED, $role, [
            'name'            => $role->name,
            'permissions_was' => $before,
            'permissions_now' => $after,
        ]);

        return response()->json(['data' => $this->formatRole($role->load('permissions:name'))]);
    }

    public function destroy(Role $role): Response
    {
        $this->requireManageAccess();

        abort_if(in_array($role->name, self::SYSTEM_ROLES), 403, 'System roles cannot be deleted.');

        $this->audit->log(AuditLog::ACTION_ROLE_DELETED, null, ['name' => $role->name]);

        $role->delete();

        return response()->noContent();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function requireManageAccess(): void
    {
        $user = auth()->user();
        abort_unless(
            $user->hasAnyRole(['super-admin', 'developer']) || $user->can('assign-roles'),
            403,
        );
    }

    // Gap 2: non-privileged actors may only add permissions they themselves hold
    private function assertPermissionsWithinActorScope(array $permissions): void
    {
        $actor = auth()->user();

        if ($actor->hasAnyRole(['super-admin', 'developer'])) {
            return;
        }

        $actorPermissions = $this->sps->allPermissions($actor);
        $forbidden        = array_diff($permissions, $actorPermissions);

        abort_if(
            !empty($forbidden),
            403,
            'You cannot assign permissions you do not hold yourself: ' . implode(', ', $forbidden),
        );
    }

    private function formatRole(Role $role): array
    {
        return [
            'id'          => $role->id,
            'name'        => $role->name,
            'permissions' => $role->permissions->pluck('name')->sort()->values(),
            'is_system'   => in_array($role->name, self::SYSTEM_ROLES),
            'is_locked'   => in_array($role->name, self::LOCKED_ROLES),
        ];
    }
}
