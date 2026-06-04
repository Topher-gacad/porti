<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCrossTenantGrantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // policy authorisation happens in the controller
    }

    public function rules(): array
    {
        return [
            'grantee_type' => ['required', 'in:user,team'],
            'grantee_id' => [
                'required', 'integer',
                Rule::exists($this->input('grantee_type') === 'team' ? 'teams' : 'users', 'id'),
            ],
            'target_company_id' => ['required', 'integer', 'exists:companies,id'],
            'target_branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'target_department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'reason' => ['nullable', 'string', 'max:500'],
            'valid_until' => ['nullable', 'date', 'after:now'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ];
    }
}
