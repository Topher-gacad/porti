<?php

namespace App\Services;

use App\Models\Company;

/**
 * Resolves which company a JIT-provisioned SSO user belongs to, from the optional
 * attributes Authentik federates (a company_code attribute and/or group memberships),
 * matched against companies.code. Returns null when nothing matches — the caller then
 * routes the user to the Unassigned review queue rather than silently defaulting a
 * stranger into a company (per the locked plan, §8).
 *
 * The pre-provisioned-email path (an admin invite) is handled before this resolver
 * runs — an invited user already carries the right company_id, so SSO never overrides it.
 * No role assignment is derived from SSO groups in the MVP.
 */
class SsoCompanyResolver
{
    public function resolve(?string $companyCode, array $groups = []): ?Company
    {
        // 1. An explicit company_code attribute is the most specific signal.
        if (is_string($companyCode) && $companyCode !== '') {
            if ($company = $this->activeByCode($companyCode)) {
                return $company;
            }
        }

        // 2. Otherwise the first group that names a known company code wins.
        foreach ($groups as $group) {
            if (is_string($group) && $group !== '' && ($company = $this->activeByCode($group))) {
                return $company;
            }
        }

        return null;
    }

    private function activeByCode(string $code): ?Company
    {
        return Company::where('code', $code)->where('is_active', true)->first();
    }
}
