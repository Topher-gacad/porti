<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    // Granular per-resource permissions (new)
    private const GRANULAR_USERS       = ['create-users', 'update-users', 'delete-users'];
    private const GRANULAR_BRANCHES    = ['create-branches', 'update-branches', 'delete-branches'];
    private const GRANULAR_DEPARTMENTS = ['create-departments', 'update-departments', 'delete-departments'];
    private const GRANULAR_TEAMS       = ['create-teams', 'update-teams', 'delete-teams'];
    private const GRANULAR_COMPANY     = ['update-company'];

    // Legacy umbrella permissions (kept for backward compat, checked alongside granular in policies)
    private const LEGACY = [
        'manage-company', 'manage-users', 'manage-branches', 'manage-departments', 'manage-teams',
    ];

    public function run(): void
    {
        $all = array_merge(
            self::GRANULAR_USERS,
            self::GRANULAR_BRANCHES,
            self::GRANULAR_DEPARTMENTS,
            self::GRANULAR_TEAMS,
            self::GRANULAR_COMPANY,
            ['assign-roles'],
            self::LEGACY,
        );

        foreach ($all as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }

        $companyAdminPerms = array_merge(
            self::GRANULAR_USERS,
            self::GRANULAR_BRANCHES,
            self::GRANULAR_DEPARTMENTS,
            self::GRANULAR_TEAMS,
            self::GRANULAR_COMPANY,
            ['assign-roles'],
            self::LEGACY,
        );

        // branch-manager: can create/update users & departments but NOT delete; full team management
        $branchManagerPerms = [
            'create-users', 'update-users',
            'create-departments', 'update-departments',
            'create-teams', 'update-teams', 'delete-teams',
            'manage-teams',
        ];

        $roleMap = [
            'super-admin'    => $all,
            'developer'      => $all,
            'company-admin'  => $companyAdminPerms,
            'branch-manager' => $branchManagerPerms,
            'manager'        => ['create-teams', 'update-teams', 'delete-teams', 'manage-teams'],
            'user'           => [],
            'viewer'         => [],
        ];

        foreach ($roleMap as $roleName => $permissions) {
            $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
            $role->syncPermissions($permissions);
            $this->command->info("Role [{$roleName}] ready with " . count($permissions) . ' permission(s).');
        }
    }
}
