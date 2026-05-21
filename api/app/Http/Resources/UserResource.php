<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'email'         => $this->email,
            'authentik_uid' => $this->authentik_uid,
            'company_id'    => $this->company_id,
            'branch_id'     => $this->branch_id,
            'department_id' => $this->department_id,
            'is_active'     => $this->is_active,
            'last_login_at' => $this->last_login_at,
            'created_at'    => $this->created_at,
            'roles'         => $this->whenLoaded('roles', fn () => $this->getRoleNames()),
        ];
    }
}
