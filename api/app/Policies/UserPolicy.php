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
        return $user->company_id !== null
            && $this->scopedCanAny($user, ['create-users', 'manage-users'], ['company_id' => $user->company_id]);
    }

    public function update(User $user, User $target): bool
    {
        return $this->scopedCanAny($user, ['update-users', 'manage-users'], [
            'company_id'    => $target->company_id,
            'branch_id'     => $target->branch_id,
            'department_id' => $target->department_id,
        ]);
    }

    public function delete(User $user, User $target): bool
    {
        if ($user->id === $target->id) {
            return false;
        }

        if ($target->company_id === null) {
            return $user->company_id !== null;
        }

        return $this->scopedCanAny($user, ['delete-users', 'manage-users'], [
            'company_id'    => $target->company_id,
            'branch_id'     => $target->branch_id,
            'department_id' => $target->department_id,
        ]);
    }

    public function assignRoles(User $user, User $target): bool
    {
        return $this->scopedCan($user, 'assign-roles', [
            'company_id'    => $target->company_id,
            'branch_id'     => $target->branch_id,
            'department_id' => $target->department_id,
        ]);
    }
}
