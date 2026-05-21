<?php

namespace App\Http\Requests\Company;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('company')->id;

        return [
            'name'      => ['sometimes', 'string', 'max:255', "unique:companies,name,{$id}"],
            'code'      => ['sometimes', 'string', 'max:50',  "unique:companies,code,{$id}"],
            'logo'      => ['nullable', 'url', 'max:2048'],
            'is_active' => ['boolean'],
        ];
    }
}
