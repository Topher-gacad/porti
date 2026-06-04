<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    private const LABELS = [
        'auth.sso.failed'      => 'SSO login failed',
        'auth.local.success'   => 'Signed in',
        'auth.local.failed'    => 'Login failed',
        'user.created'         => 'User created',
        'user.updated'         => 'User updated',
        'user.deleted'         => 'User deleted',
        'branch.created'       => 'Branch created',
        'branch.updated'       => 'Branch updated',
        'branch.deleted'       => 'Branch deleted',
        'department.created'   => 'Department created',
        'department.updated'   => 'Department updated',
        'department.deleted'   => 'Department deleted',
        'team.created'         => 'Team created',
        'team.updated'         => 'Team updated',
        'team.deleted'         => 'Team deleted',
        'company.updated'      => 'Company updated',
        'role.assigned'        => 'Role assigned',
        'role.revoked'         => 'Role revoked',
        'team.member.added'    => 'Team member added',
        'team.member.removed'  => 'Team member removed',
    ];

    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'action'      => $this->action,
            'label'       => self::LABELS[$this->action] ?? $this->action,
            'target_type' => $this->target_type,
            'target_id'   => $this->target_id,
            'payload'     => $this->payload,
            'ip_address'  => $this->ip_address,
            'created_at'  => $this->created_at,
            'actor'       => $this->whenLoaded('user', fn () => $this->user
                ? ['id' => $this->user->id, 'name' => $this->user->name, 'email' => $this->user->email]
                : null
            ),
        ];
    }
}
