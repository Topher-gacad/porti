<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Company;
use Illuminate\Database\Eloquent\Model;

class AuditLogger
{
    /**
     * Write an audit entry. Records system-originated events (SSO bootstrap, queued
     * jobs, console commands) with a null actor rather than silently dropping them —
     * a partial audit trail is worse than a complete one with explicit system rows.
     */
    public function log(string $action, ?Model $target = null, array $payload = []): void
    {
        $actor = auth()->user();

        AuditLog::create([
            'user_id' => $actor?->id,
            'company_id' => $actor?->company_id ?? $this->companyIdFor($target),
            'action' => $action,
            'target_type' => $target ? strtolower(class_basename($target)) : null,
            'target_id' => $target?->getKey(),
            'payload' => empty($payload) ? null : $payload,
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
            'created_at' => now(),
        ]);
    }

    /**
     * Attribute a system event to a company when there is no actor: the company
     * itself, or the target's company_id when it carries one.
     */
    private function companyIdFor(?Model $target): ?int
    {
        if ($target === null) {
            return null;
        }

        if ($target instanceof Company) {
            return $target->getKey();
        }

        return $target->company_id ?? null;
    }
}
