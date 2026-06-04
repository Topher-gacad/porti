<?php

namespace App\Observers;

use App\Models\AuditLog;
use App\Models\Team;
use App\Services\AuditLogger;

class TeamObserver
{
    public function created(Team $team): void
    {
        app(AuditLogger::class)->log(AuditLog::ACTION_TEAM_CREATED, $team, [
            'name' => $team->name,
        ]);
    }

    public function updated(Team $team): void
    {
        $changes = $team->getChanges();
        unset($changes['updated_at']);

        if (! empty($changes)) {
            app(AuditLogger::class)->log(AuditLog::ACTION_TEAM_UPDATED, $team, ['changes' => $changes]);
        }
    }

    public function deleted(Team $team): void
    {
        app(AuditLogger::class)->log(AuditLog::ACTION_TEAM_DELETED, $team, [
            'name' => $team->name,
        ]);
    }

    public function restored(Team $team): void
    {
        app(AuditLogger::class)->log(AuditLog::ACTION_TEAM_RESTORED, $team, [
            'name' => $team->name,
        ]);
    }

    public function forceDeleted(Team $team): void
    {
        app(AuditLogger::class)->log(AuditLog::ACTION_TEAM_FORCE_DELETED, $team, [
            'name' => $team->name,
        ]);
    }
}
