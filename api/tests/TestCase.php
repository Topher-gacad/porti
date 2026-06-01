<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Spatie\Permission\Models\Role;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Spatie Permission resolves roles by guard name. Our roles are seeded
        // with guard 'web'. Lock the default here and clear Spatie's static guard
        // cache so syncRoles() / findByName() use 'web' even when Sanctum::actingAs()
        // has previously cached 'sanctum' as the resolved guard for User.
        config(['auth.defaults.guard' => 'web']);
        // Reset the auth manager's defaultDriver so Sanctum::actingAs() from a
        // previous test cannot bleed its 'sanctum' guard into this test's setup.
        app('auth')->setDefaultDriver('web');
    }

    // Passes a Role object to syncRoles() so Spatie skips guard-name resolution,
    // which breaks when Sanctum::actingAs() has set the default guard to 'sanctum'.
    protected function assignRole(User $user, string $roleName): void
    {
        $role = Role::where('name', $roleName)->where('guard_name', 'web')->firstOrFail();
        $user->syncRoles([$role]);
        $user->unsetRelation('roles');
    }
}
