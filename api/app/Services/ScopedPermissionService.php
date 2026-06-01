<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserRoleAssignment;
use Illuminate\Support\Collection;

class ScopedPermissionService
{
    /**
     * Check if a user has a permission within the given resource context.
     *
     * Context keys: company_id, branch_id, department_id (all optional/nullable).
     * An assignment "covers" a context when its scope matches at least one of the
     * context values, or when it is global. The check falls back to Spatie's flat
     * model for users who have no scoped assignments yet (safe migration path).
     */
    public function can(User $user, string $permission, array $context = []): bool
    {
        $assignments = $this->assignments($user);

        if ($assignments->isEmpty()) {
            return $user->can($permission);
        }

        foreach ($assignments as $assignment) {
            if ($this->covers($assignment, $context)
                && $assignment->role->permissions->pluck('name')->contains($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Return the union of all permissions granted across every scoped assignment.
     */
    public function allPermissions(User $user): array
    {
        $assignments = $this->assignments($user);

        if ($assignments->isEmpty()) {
            return $user->getPermissionsViaRoles()->pluck('name')->toArray();
        }

        return $assignments
            ->flatMap(fn ($a) => $a->role->permissions->pluck('name'))
            ->unique()
            ->values()
            ->toArray();
    }

    /**
     * Return the unique role names across all scoped assignments.
     */
    public function allRoles(User $user): array
    {
        $assignments = $this->assignments($user);

        if ($assignments->isEmpty()) {
            return $user->getRoleNames()->toArray();
        }

        return $assignments
            ->pluck('role.name')
            ->unique()
            ->values()
            ->toArray();
    }

    private function assignments(User $user): Collection
    {
        // Eagerly load if not yet loaded or role permissions are missing
        $loaded = $user->relationLoaded('roleAssignments');
        $needsLoad = ! $loaded || ($user->roleAssignments->isNotEmpty()
            && ! $user->roleAssignments->first()->relationLoaded('role'));

        if ($needsLoad) {
            $user->load('roleAssignments.role.permissions');
        }

        return $user->roleAssignments;
    }

    private function covers(UserRoleAssignment $assignment, array $context): bool
    {
        return match ($assignment->scope_type) {
            UserRoleAssignment::SCOPE_GLOBAL => true,
            UserRoleAssignment::SCOPE_COMPANY => $this->scopeMatches($assignment, $context, 'company_id'),
            UserRoleAssignment::SCOPE_BRANCH => $this->scopeMatches($assignment, $context, 'branch_id'),
            UserRoleAssignment::SCOPE_DEPARTMENT => $this->scopeMatches($assignment, $context, 'department_id'),
            default => false,
        };
    }

    /**
     * True when the context carries the scope's id and it equals the assignment's
     * scope_id. Both sides are cast to int so the match holds under MySQL/MariaDB,
     * where PDO returns id columns as strings (a strict === would silently fail).
     */
    private function scopeMatches(UserRoleAssignment $assignment, array $context, string $key): bool
    {
        return isset($context[$key])
            && $context[$key] !== null
            && $assignment->scope_id !== null
            && (int) $assignment->scope_id === (int) $context[$key];
    }
}
