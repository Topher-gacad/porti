<?php

namespace App\Providers;

use App\Models\AuditLog;
use App\Models\Team;
use App\Models\User;
use Illuminate\Auth\Events\Failed;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        // Constrain polymorphic relations to known model types.
        // Prevents arbitrary class names from being stored in *_type columns.
        Relation::enforceMorphMap([
            'user' => User::class,
            'team' => Team::class,
        ]);

        // Log every failed login attempt for security monitoring.
        Event::listen(Failed::class, function (Failed $event) {
            AuditLog::create([
                'action'      => AuditLog::ACTION_AUTH_SSO_FAILED,
                'target_type' => 'user',
                'payload'     => ['identifier' => $event->credentials['email'] ?? $event->credentials['username'] ?? null],
                'ip_address'  => request()->ip(),
                'user_agent'  => request()->userAgent(),
            ]);
        });
    }
}
