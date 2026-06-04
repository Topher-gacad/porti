<?php

namespace App\Policies;

use App\Models\Department;
use App\Models\User;

class DepartmentPolicy extends BasePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Department $department): bool
    {
        return $this->inAllowedCompany($user, $department->company_id);
    }

    public function create(User $user): bool
    {
        return $user->company_id !== null
            && $this->scopedCanAny($user, ['create-departments', 'manage-departments'], ['company_id' => $user->company_id]);
    }

    public function update(User $user, Department $department): bool
    {
        return $this->scopedCanAny($user, ['update-departments', 'manage-departments'], [
            'company_id' => $department->company_id,
            'branch_id'  => $department->branch_id,
        ]);
    }

    public function delete(User $user, Department $department): bool
    {
        return $this->scopedCanAny($user, ['delete-departments', 'manage-departments'], [
            'company_id' => $department->company_id,
            'branch_id'  => $department->branch_id,
        ]);
    }
}
