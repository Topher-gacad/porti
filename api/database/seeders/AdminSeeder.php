<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'developer',   'guard_name' => 'web']);

        // Create a local developer account. Only runs outside production.
        // Set DEV_USER_EMAIL and DEV_USER_PASSWORD in your .env before seeding.
        if (app()->isProduction()) {
            return;
        }

        $email = env('DEV_USER_EMAIL');
        if (!$email) {
            $this->command->warn('DEV_USER_EMAIL not set — skipping developer user creation.');
            return;
        }

        $dev = User::firstOrCreate(
            ['email' => $email],
            [
                'name'      => 'Developer',
                'password'  => env('DEV_USER_PASSWORD', 'changeme'),
                'is_active' => true,
            ],
        );

        $dev->assignRole('developer');
        $this->command->info("Developer user ready: {$email}");
    }
}
