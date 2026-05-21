<?php

namespace App\Policies;

use App\Models\Branch;
use App\Models\User;

class BranchPolicy extends BasePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Branch $branch): bool
    {
        return $this->inAllowedCompany($user, $branch->company_id);
    }

    public function create(User $user): bool
    {
        return $user->company_id !== null;
    }

    public function update(User $user, Branch $branch): bool
    {
        return $user->company_id === $branch->company_id;
    }

    public function delete(User $user, Branch $branch): bool
    {
        return $user->company_id === $branch->company_id;
    }
}
