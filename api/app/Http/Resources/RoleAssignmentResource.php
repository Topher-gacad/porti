<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleAssignmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'role_id'     => $this->role_id,
            'role'        => $this->whenLoaded('role', fn () => $this->role->name),
            'scope_type'  => $this->scope_type,
            'scope_id'    => $this->scope_id,
            'assigned_by' => $this->whenLoaded('assignedBy', fn () => $this->assignedBy
                ? ['id' => $this->assignedBy->id, 'name' => $this->assignedBy->name]
                : null
            ),
            'created_at'  => $this->created_at,
        ];
    }
}
