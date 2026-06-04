<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBranchAccessGrantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'branch_id'    => ['required', 'integer', 'exists:branches,id'],
            'grantee_type' => ['required', 'in:user,team'],
            'grantee_id'   => ['required', 'integer'],
            'reason'       => ['nullable', 'string', 'max:500'],
            'valid_until'  => ['nullable', 'date', 'after:now'],
        ];
    }
}
