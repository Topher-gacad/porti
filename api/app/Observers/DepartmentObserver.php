<?php

namespace App\Observers;

use App\Models\AuditLog;
use App\Models\Department;
use App\Services\AuditLogger;

class DepartmentObserver
{
    public function created(Department $department): void
    {
        app(AuditLogger::class)->log(AuditLog::ACTION_DEPT_CREATED, $department, [
            'name' => $department->name,
            'code' => $department->code,
        ]);
    }

    public function updated(Department $department): void
    {
        $changes = $department->getChanges();
        unset($changes['updated_at']);

        if (! empty($changes)) {
            app(AuditLogger::class)->log(AuditLog::ACTION_DEPT_UPDATED, $department, ['changes' => $changes]);
        }
    }

    public function deleted(Department $department): void
    {
        app(AuditLogger::class)->log(AuditLog::ACTION_DEPT_DELETED, $department, [
            'name' => $department->name,
            'code' => $department->code,
        ]);
    }

    public function restored(Department $department): void
    {
        app(AuditLogger::class)->log(AuditLog::ACTION_DEPT_RESTORED, $department, [
            'name' => $department->name,
            'code' => $department->code,
        ]);
    }

    public function forceDeleted(Department $department): void
    {
        app(AuditLogger::class)->log(AuditLog::ACTION_DEPT_FORCE_DELETED, $department, [
            'name' => $department->name,
            'code' => $department->code,
        ]);
    }
}
