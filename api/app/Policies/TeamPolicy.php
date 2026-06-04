<?php

namespace App\Policies;

use App\Models\Team;
use App\Models\User;

class TeamPolicy extends BasePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Team $team): bool
    {
        return $this->inAllowedCompany($user, $team->company_id);
    }

    public function create(User $user): bool
    {
        return $user->company_id !== null
            && $this->scopedCanAny($user, ['create-teams', 'manage-teams'], ['company_id' => $user->company_id]);
    }

    public function update(User $user, Team $team): bool
    {
        return $this->scopedCanAny($user, ['update-teams', 'manage-teams'], ['company_id' => $team->company_id]);
    }

    public function delete(User $user, Team $team): bool
    {
        return $this->scopedCanAny($user, ['delete-teams', 'manage-teams'], ['company_id' => $team->company_id]);
    }
}
