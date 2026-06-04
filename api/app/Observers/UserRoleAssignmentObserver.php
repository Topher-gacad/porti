<?php

namespace App\Observers;

use App\Models\AuditLog;
use App\Models\UserRoleAssignment;
use App\Services\AuditLogger;

class UserRoleAssignmentObserver
{
    public function created(UserRoleAssignment $assignment): void
    {
        $target = $assignment->user;

        app(AuditLogger::class)->log(AuditLog::ACTION_ROLE_ASSIGNED, $target, [
            'role' => $this->roleName($assignment),
            'scope_type' => $assignment->scope_type,
            'scope_id' => $assignment->scope_id,
            'assigned_to' => $target ? ['id' => $target->id, 'name' => $target->name] : null,
        ]);
    }

    public function deleted(UserRoleAssignment $assignment): void
    {
        app(AuditLogger::class)->log(AuditLog::ACTION_ROLE_REVOKED, $assignment->user, [
            'role' => $this->roleName($assignment),
            'scope_type' => $assignment->scope_type,
            'scope_id' => $assignment->scope_id,
        ]);
    }

    // Uses the cached relation when available, otherwise loads it once.
    private function roleName(UserRoleAssignment $assignment): string
    {
        return $assignment->role?->name ?? "role #{$assignment->role_id}";
    }
}
