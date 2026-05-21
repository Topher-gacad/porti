<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('user')->id;

        return [
            'name'          => ['sometimes', 'string', 'max:255'],
            'email'         => ['sometimes', 'email', 'max:255', "unique:users,email,{$id}"],
            'password'      => ['nullable', 'string', 'min:12'],
            'company_id'    => ['nullable', 'integer', 'exists:companies,id'],
            'branch_id'     => ['nullable', 'integer', 'exists:branches,id'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'is_active'     => ['boolean'],
        ];
    }
}
