<?php

namespace App\Observers;

use App\Models\AuditLog;
use App\Models\Branch;
use App\Services\AuditLogger;

class BranchObserver
{
    public function created(Branch $branch): void
    {
        app(AuditLogger::class)->log(AuditLog::ACTION_BRANCH_CREATED, $branch, [
            'name' => $branch->name,
            'code' => $branch->code,
        ]);
    }

    public function updated(Branch $branch): void
    {
        $changes = $branch->getChanges();
        unset($changes['updated_at']);

        if (! empty($changes)) {
            app(AuditLogger::class)->log(AuditLog::ACTION_BRANCH_UPDATED, $branch, ['changes' => $changes]);
        }
    }

    public function deleted(Branch $branch): void
    {
        app(AuditLogger::class)->log(AuditLog::ACTION_BRANCH_DELETED, $branch, [
            'name' => $branch->name,
            'code' => $branch->code,
        ]);
    }

    public function restored(Branch $branch): void
    {
        app(AuditLogger::class)->log(AuditLog::ACTION_BRANCH_RESTORED, $branch, [
            'name' => $branch->name,
            'code' => $branch->code,
        ]);
    }

    public function forceDeleted(Branch $branch): void
    {
        app(AuditLogger::class)->log(AuditLog::ACTION_BRANCH_FORCE_DELETED, $branch, [
            'name' => $branch->name,
            'code' => $branch->code,
        ]);
    }
}
