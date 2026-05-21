<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy extends BasePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, User $target): bool
    {
        return $this->inAllowedCompany($user, $target->company_id);
    }

    public function create(User $user): bool
    {
        return $user->company_id !== null;
    }

    public function update(User $user, User $target): bool
    {
        return $user->company_id === $target->company_id;
    }

    public function delete(User $user, User $target): bool
    {
        return $user->company_id === $target->company_id && $user->id !== $target->id;
    }
}
