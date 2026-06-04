<?php

namespace App\Policies;

use App\Models\CrossTenantGrant;
use App\Models\User;

/**
 * Cross-company grants are the most powerful authorisation primitive in the system, so
 * (per the locked plan, decision #9) only super-admin/developer may create or revoke them.
 *
 * BasePolicy::before() returns true for super-admin/developer (short-circuit) and null for
 * everyone else — so these methods returning false make the surface privileged-only with
 * no extra checks, even when the dev-phase admin-only gate is lifted.
 */
class CrossTenantGrantPolicy extends BasePolicy
{
    public function viewAny(User $user): bool
    {
        return false;
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function delete(User $user, CrossTenantGrant $grant): bool
    {
        return false;
    }
}
