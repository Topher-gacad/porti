<?php

namespace App\Observers;

use App\Models\AuditLog;
use App\Models\User;
use App\Services\AuditLogger;

class UserObserver
{
    public function created(User $user): void
    {
        app(AuditLogger::class)->log(AuditLog::ACTION_USER_CREATED, $user, [
            'name'          => $user->name,
            'email'         => $user->email,
            'company_id'    => $user->company_id,
            'branch_id'     => $user->branch_id,
            'department_id' => $user->department_id,
        ]);
    }

    public function updated(User $user): void
    {
        $changes = $user->getChanges();
        unset($changes['updated_at'], $changes['password'], $changes['remember_token'], $changes['last_login_at']);

        if (empty($changes)) {
            return;
        }

        app(AuditLogger::class)->log(AuditLog::ACTION_USER_UPDATED, $user, ['changes' => $changes]);
    }

    public function deleted(User $user): void
    {
        app(AuditLogger::class)->log(AuditLog::ACTION_USER_DELETED, $user, [
            'name'  => $user->name,
            'email' => $user->email,
        ]);
    }
}
