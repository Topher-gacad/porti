<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $superAdminRole = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
        $developerRole  = Role::firstOrCreate(['name' => 'developer',   'guard_name' => 'web']);

        $this->createSuperAdmin($superAdminRole);

        if (!app()->isProduction()) {
            $this->createDeveloper($developerRole);
        }
    }

    private function createSuperAdmin(Role $role): void
    {
        $email    = env('SUPER_ADMIN_EMAIL');
        $password = env('SUPER_ADMIN_PASSWORD');

        if (!$email || !$password) {
            $this->command->warn('SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set — skipping superadmin creation.');
            return;
        }

        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name'      => 'Super Admin',
                'password'  => $password,
                'is_active' => true,
            ],
        );

        if (!$user->hasRole('super-admin')) {
            $user->assignRole($role);
        }

        $this->command->info("Superadmin ready: {$email}");
    }

    private function createDeveloper(Role $role): void
    {
        $email    = env('DEV_USER_EMAIL');
        $password = env('DEV_USER_PASSWORD');

        if (!$email || !$password) {
            $this->command->warn('DEV_USER_EMAIL or DEV_USER_PASSWORD not set — skipping developer user creation.');
            return;
        }

        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name'      => 'Developer',
                'password'  => $password,
                'is_active' => true,
            ],
        );

        if (!$user->hasRole('developer')) {
            $user->assignRole($role);
        }

        $this->command->info("Developer user ready: {$email}");
    }
}
