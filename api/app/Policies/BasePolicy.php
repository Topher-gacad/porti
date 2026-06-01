<?php

namespace App\Policies;

use App\Models\CrossTenantGrant;
use App\Models\User;
use App\Services\ScopedPermissionService;
use Illuminate\Support\Facades\DB;

abstract class BasePolicy
{
    public function before(User $user): ?bool
    {
        if (!$user->is_active) {
            return false;
        }

        return $user->hasAnyRole(['super-admin', 'developer']) ? true : null;
    }

    /**
     * Check a permission against scoped assignments, with resource context.
     * Context keys: company_id, branch_id, department_id
     */
    protected function scopedCan(User $user, string $permission, array $context = []): bool
    {
        return app(ScopedPermissionService::class)->can($user, $permission, $context);
    }

    /**
     * Returns true if the user holds ANY of the given permissions in the given context.
     * Use this when a granular permission (e.g. delete-users) OR a legacy umbrella (manage-users)
     * should both be accepted.
     */
    protected function scopedCanAny(User $user, array $permissions, array $context = []): bool
    {
        $sps = app(ScopedPermissionService::class);
        foreach ($permissions as $permission) {
            if ($sps->can($user, $permission, $context)) {
                return true;
            }
        }
        return false;
    }

    protected function inAllowedCompany(User $user, ?int $companyId): bool
    {
        if ($companyId === null) {
            return false;
        }

        if ($user->company_id === $companyId) {
            return true;
        }

        // Company-scoped role assignment grants visibility to that company
        if (DB::table('user_role_assignments')
            ->where('user_id', $user->id)
            ->where('scope_type', 'company')
            ->where('scope_id', $companyId)
            ->exists()) {
            return true;
        }

        // Use DB::table to avoid recursive CompanyScope when loading team memberships
        $teamIds = DB::table('team_members')
            ->where('user_id', $user->id)
            ->pluck('team_id')
            ->toArray();

        return CrossTenantGrant::active()
            ->where('target_company_id', $companyId)
            ->where(function ($q) use ($user, $teamIds) {
                $q->where(function ($q) use ($user) {
                    $q->where('grantee_type', 'user')->where('grantee_id', $user->id);
                });
                if (!empty($teamIds)) {
                    $q->orWhere(function ($q) use ($teamIds) {
                        $q->where('grantee_type', 'team')->whereIn('grantee_id', $teamIds);
                    });
                }
            })
            ->exists();
    }
}
