<?php

namespace App\Http\Controllers;

use App\Http\Requests\RoleAssignment\StoreRoleAssignmentRequest;
use App\Http\Resources\RoleAssignmentResource;
use App\Models\User;
use App\Models\UserRoleAssignment;
use App\Services\RoleAssignmentGuard;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Role;
use Symfony\Component\HttpFoundation\Response;

class RoleAssignmentController extends Controller
{
    public function __construct(
        private readonly RoleAssignmentGuard $guard,
    ) {}

    public function index(User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $assignments = $user->roleAssignments()
            ->with('role:id,name', 'assignedBy:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => RoleAssignmentResource::collection($assignments)]);
    }

    public function store(StoreRoleAssignmentRequest $request, User $user): JsonResponse
    {
        $this->authorize('assignRoles', $user);

        $data = $request->validated();
        $actor = auth()->user();

        $role = Role::findById($data['role_id'], 'web');

        // Gap 1: prevent privilege escalation — assigner cannot grant equal-or-higher roles
        $this->guard->assertCanGrantRole($actor, $role);

        // Gap 3: assigner must have access to the scope they are granting
        $this->guard->assertScopeAccess($actor, $data['scope_type'], $data['scope_id'] ?? null);

        // Gap 9: prevent duplicate assignments
        $exists = UserRoleAssignment::where('user_id', $user->id)
            ->where('role_id', $data['role_id'])
            ->where('scope_type', $data['scope_type'])
            ->where(function ($q) use ($data) {
                $scopeId = $data['scope_id'] ?? null;
                $scopeId ? $q->where('scope_id', $scopeId) : $q->whereNull('scope_id');
            })
            ->exists();

        abort_if($exists, 422, 'This assignment already exists.');

        $assignment = $user->roleAssignments()->create([
            'role_id' => $data['role_id'],
            'scope_type' => $data['scope_type'],
            'scope_id' => $data['scope_type'] === UserRoleAssignment::SCOPE_GLOBAL
                ? null
                : ($data['scope_id'] ?? null),
            'assigned_by' => $actor->id,
        ]);

        $this->syncSpatieRoles($user);

        // Audit trail is written by UserRoleAssignmentObserver (single source of
        // truth, so the user-endpoint "roles" array path is covered too).

        // Gap 5: invalidate the target user's tokens — permissions changed
        $user->tokens()->where('name', 'login')->delete();

        return response()->json(
            ['data' => new RoleAssignmentResource($assignment->load('role:id,name', 'assignedBy:id,name'))],
            201,
        );
    }

    public function destroy(User $user, UserRoleAssignment $assignment): Response
    {
        $this->authorize('assignRoles', $user);

        abort_if($assignment->user_id !== $user->id, 404);

        $assignment->delete();

        $this->syncSpatieRoles($user);

        // Audit trail (role.revoked) is written by UserRoleAssignmentObserver.

        // Gap 5: invalidate tokens after revocation
        $user->tokens()->where('name', 'login')->delete();

        return response()->noContent();
    }

    private function syncSpatieRoles(User $user): void
    {
        $user->syncFlatRolesFromAssignments();
    }
}
