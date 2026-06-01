<?php

namespace App\Providers;

use App\Models\AuditLog;
use App\Models\Branch;
use App\Models\Company;
use App\Models\Department;
use App\Models\Team;
use App\Models\User;
use App\Models\UserRoleAssignment;
use App\Observers\BranchObserver;
use App\Observers\CompanyObserver;
use App\Observers\DepartmentObserver;
use App\Observers\TeamObserver;
use App\Observers\UserObserver;
use App\Observers\UserRoleAssignmentObserver;
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
        Relation::enforceMorphMap([
            'user' => User::class,
            'team' => Team::class,
        ]);

        // Model observers — write audit entries for all CRUD operations.
        User::observe(UserObserver::class);
        Branch::observe(BranchObserver::class);
        Department::observe(DepartmentObserver::class);
        Team::observe(TeamObserver::class);
        Company::observe(CompanyObserver::class);
        UserRoleAssignment::observe(UserRoleAssignmentObserver::class);

        // Log every failed login attempt for security monitoring.
        Event::listen(Failed::class, function (Failed $event) {
            AuditLog::create([
                'action' => AuditLog::ACTION_AUTH_SSO_FAILED,
                'target_type' => 'user',
                'payload' => ['identifier' => $event->credentials['email'] ?? $event->credentials['username'] ?? null],
                'ip_address' => request()?->ip(),
                'user_agent' => request()?->userAgent(),
                'created_at' => now(),
            ]);
        });
    }
}
