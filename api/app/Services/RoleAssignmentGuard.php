<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserRoleAssignment;
use Spatie\Permission\Models\Role;

/**
 * Enforces the two escalation guards around granting a role to a user:
 *   1. Privilege level — an actor may only grant roles strictly below their own.
 *   2. Scope access    — an actor may only grant a scope they themselves hold,
 *                         and only privileged actors may grant the all-tenant
 *                         global scope.
 *
 * Shared by RoleAssignmentController (explicit scoped assignments) and
 * UserController (the simple "roles" array on user create/update) so both
 * paths apply the same rules.
 */
class RoleAssignmentGuard
{
    // Privilege level per system role — higher = more privileged.
    // Custom roles default to DEFAULT_CUSTOM_LEVEL (30), below branch-manager (50),
    // so any actor at branch-manager level or above can assign a custom role.
    private const ROLE_LEVELS = [
        'super-admin' => 100,
        'developer' => 100,
        'company-admin' => 70,
        'branch-manager' => 50,
        'manager' => 40,
        'viewer' => 10,
        'user' => 10,
    ];

    private const DEFAULT_CUSTOM_LEVEL = 30;

    public function __construct(private readonly TenantAccess $tenant) {}

    /**
     * An actor may not grant a role at or above their own privilege level, and
     * only super-admin/developer may grant the locked super-admin/developer roles.
     */
    public function assertCanGrantRole(User $actor, Role $role): void
    {
        if ($this->tenant->isPrivileged($actor)) {
            return;
        }

        if (in_array($role->name, ['super-admin', 'developer'])) {
            abort(403, 'Only super-admins can grant this role.');
        }

        $roleLevel = self::ROLE_LEVELS[$role->name] ?? self::DEFAULT_CUSTOM_LEVEL;
        $actorLevel = $this->actorMaxLevel($actor);

        abort_if(
            $roleLevel >= $actorLevel,
            403,
            'You can only assign roles with a privilege level strictly below your own.',
        );
    }

    /**
     * The actor must have access to the scope they are granting. Only privileged
     * actors may grant the global (all-tenant) scope; for everyone else a global
     * grant is forbidden because its permissions apply across every tenant.
     */
    public function assertScopeAccess(User $actor, string $scopeType, ?int $scopeId): void
    {
        if ($scopeType === UserRoleAssignment::SCOPE_GLOBAL) {
            abort_unless(
                $this->tenant->isPrivileged($actor),
                403,
                'Only administrators can grant a global-scoped role.',
            );

            return;
        }

        if ($scopeId === null) {
            return;
        }

        if ($this->tenant->isPrivileged($actor)) {
            return;
        }

        $allowed = match ($scopeType) {
            UserRoleAssignment::SCOPE_COMPANY => $this->tenant->allowedCompanyIds($actor),
            UserRoleAssignment::SCOPE_BRANCH => $this->tenant->allowedBranchIds($actor),
            UserRoleAssignment::SCOPE_DEPARTMENT => $this->tenant->allowedDepartmentIds($actor),
            default => [],
        };

        abort_unless(
            in_array($scopeId, $allowed),
            403,
            "You do not have access to the requested {$scopeType}.",
        );
    }

    private function actorMaxLevel(User $actor): int
    {
        $levels = $actor->getRoleNames()
            ->map(fn ($name) => self::ROLE_LEVELS[$name] ?? self::DEFAULT_CUSTOM_LEVEL)
            ->toArray();

        return ! empty($levels) ? max($levels) : 0;
    }
}
