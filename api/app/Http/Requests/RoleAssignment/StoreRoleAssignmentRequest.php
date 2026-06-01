<?php

namespace App\Http\Requests\RoleAssignment;

use App\Models\UserRoleAssignment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRoleAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role_id'    => ['required', 'integer', 'exists:roles,id'],
            'scope_type' => ['required', 'string', Rule::in([
                UserRoleAssignment::SCOPE_GLOBAL,
                UserRoleAssignment::SCOPE_COMPANY,
                UserRoleAssignment::SCOPE_BRANCH,
                UserRoleAssignment::SCOPE_DEPARTMENT,
            ])],
            'scope_id'   => [
                Rule::requiredIf(fn () => $this->input('scope_type') !== UserRoleAssignment::SCOPE_GLOBAL),
                'nullable',
                'integer',
                'min:1',
            ],
        ];
    }
}
