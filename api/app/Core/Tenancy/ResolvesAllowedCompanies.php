<?php

namespace App\Core\Tenancy;

use App\Models\CrossTenantGrant;
use Illuminate\Support\Facades\DB;

/**
 * Shared resolution of the company ids a user may see.
 *
 * Extracted so the record-isolation scope (CompanyScope) and the config-visibility
 * scope (ConfigVisibilityScope) compute "allowed companies" identically and can never
 * drift — the single most dangerous source of a cross-tenant leak. Any change to how
 * company visibility is derived (e.g. a new grant type) lands here once.
 */
trait ResolvesAllowedCompanies
{
    /**
     * The team ids a user belongs to. Queried against the pivot directly to avoid
     * recursively triggering CompanyScope on the Team model.
     */
    protected function userTeamIds($user): array
    {
        return DB::table('team_members')
            ->where('user_id', $user->id)
            ->pluck('team_id')
            ->toArray();
    }

    /**
     * The company ids a user may access: their own company, any company they hold a
     * company-scoped role in, and any company granted via an active CrossTenantGrant
     * (to the user directly or to one of their teams).
     */
    protected function allowedCompanyIds($user, array $teamIds): array
    {
        $ids = array_filter([$user->company_id]);

        // Company-scoped role assignments grant visibility to those companies
        $fromAssignments = DB::table('user_role_assignments')
            ->where('user_id', $user->id)
            ->where('scope_type', 'company')
            ->whereNotNull('scope_id')
            ->pluck('scope_id')
            ->toArray();

        $granted = CrossTenantGrant::active()
            ->where(function ($q) use ($user, $teamIds) {
                $q->where(function ($q) use ($user) {
                    $q->where('grantee_type', 'user')->where('grantee_id', $user->id);
                });
                if (! empty($teamIds)) {
                    $q->orWhere(function ($q) use ($teamIds) {
                        $q->where('grantee_type', 'team')->whereIn('grantee_id', $teamIds);
                    });
                }
            })
            ->pluck('target_company_id')
            ->filter()
            ->toArray();

        return array_unique(array_merge($ids, $fromAssignments, $granted));
    }
}
