<?php

namespace App\Policies;

use App\Models\CrossTenantGrant;
use App\Models\User;

abstract class BasePolicy
{
    public function before(User $user): ?bool
    {
        return $user->hasAnyRole(['super-admin', 'developer']) ? true : null;
    }

    protected function inAllowedCompany(User $user, int $companyId): bool
    {
        if ($user->company_id === $companyId) {
            return true;
        }

        $teamIds = $user->teams()->pluck('teams.id')->toArray();

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
