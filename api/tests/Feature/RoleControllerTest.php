<?php

namespace Tests\Feature;

use App\Http\Middleware\AdminOnly;
use App\Models\AuditLog;
use App\Models\Company;
use App\Models\User;
use App\Models\UserRoleAssignment;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RoleControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        $this->withoutMiddleware(AdminOnly::class);
    }

    private function superAdmin(): User
    {
        $user = User::factory()->create(['is_active' => true]);
        $role = Role::findByName('super-admin', 'web');
        UserRoleAssignment::create(['user_id' => $user->id, 'role_id' => $role->id, 'scope_type' => 'global', 'scope_id' => null]);
        $this->assignRole($user, 'super-admin');
        return $user;
    }

    private function actorWithRole(string $roleName): User
    {
        $company = Company::create(['name' => 'Co', 'code' => 'CO', 'is_active' => true, 'enforce_branch_isolation' => false]);
        $user    = User::factory()->create(['company_id' => $company->id, 'is_active' => true]);
        $role    = Role::findByName($roleName, 'web');
        UserRoleAssignment::create(['user_id' => $user->id, 'role_id' => $role->id, 'scope_type' => 'global', 'scope_id' => null]);
        $this->assignRole($user, $roleName);
        return $user;
    }

    private function actorWithCustomRole(Role $role): User
    {
        $company = Company::create(['name' => 'Co2', 'code' => 'C2', 'is_active' => true, 'enforce_branch_isolation' => false]);
        $user    = User::factory()->create(['company_id' => $company->id, 'is_active' => true]);
        UserRoleAssignment::create(['user_id' => $user->id, 'role_id' => $role->id, 'scope_type' => 'global', 'scope_id' => null]);
        $this->assignRole($user, $role->name);
        return $user;
    }

    // ── Locked / system role guards ───────────────────────────────────────────

    public function test_locked_role_cannot_be_modified(): void
    {
        Sanctum::actingAs($this->superAdmin());
        $role = Role::findByName('super-admin', 'web');

        $this->patchJson("/api/v1/roles/{$role->id}", ['permissions' => []])
            ->assertForbidden();
    }

    public function test_locked_developer_role_cannot_be_modified(): void
    {
        Sanctum::actingAs($this->superAdmin());
        $role = Role::findByName('developer', 'web');

        $this->patchJson("/api/v1/roles/{$role->id}", ['permissions' => []])
            ->assertForbidden();
    }

    public function test_system_role_cannot_be_deleted(): void
    {
        Sanctum::actingAs($this->superAdmin());
        $role = Role::findByName('manager', 'web');

        $this->deleteJson("/api/v1/roles/{$role->id}")->assertForbidden();
    }

    public function test_viewer_system_role_cannot_be_deleted(): void
    {
        Sanctum::actingAs($this->superAdmin());
        $role = Role::findByName('viewer', 'web');

        $this->deleteJson("/api/v1/roles/{$role->id}")->assertForbidden();
    }

    public function test_custom_role_can_be_deleted(): void
    {
        Sanctum::actingAs($this->superAdmin());
        $role = Role::create(['name' => 'disposable', 'guard_name' => 'web']);

        $this->deleteJson("/api/v1/roles/{$role->id}")->assertNoContent();
        $this->assertDatabaseMissing('roles', ['id' => $role->id]);
    }

    // ── Permission escalation guard (Gap 2) ────────────────────────────────────

    public function test_actor_cannot_create_role_with_permission_they_dont_hold(): void
    {
        // Create a custom role with assign-roles (needed for requireManageAccess)
        // but without delete-users — simulates a partially-privileged role manager.
        $customRole = Role::create(['name' => 'partial-admin', 'guard_name' => 'web']);
        $customRole->syncPermissions(['assign-roles', 'create-users', 'update-users']);

        $actor = $this->actorWithCustomRole($customRole);
        Sanctum::actingAs($actor);

        // Actor doesn't have delete-users — should be forbidden
        $this->postJson('/api/v1/roles', [
            'name'        => 'sneaky-role',
            'permissions' => ['delete-users'],
        ])->assertForbidden();
    }

    public function test_actor_can_create_role_with_only_permissions_they_hold(): void
    {
        $customRole = Role::create(['name' => 'partial-admin', 'guard_name' => 'web']);
        $customRole->syncPermissions(['assign-roles', 'create-users', 'update-users']);

        $actor = $this->actorWithCustomRole($customRole);
        Sanctum::actingAs($actor);

        // Actor HAS create-users — allowed
        $this->postJson('/api/v1/roles', [
            'name'        => 'restricted-creator',
            'permissions' => ['create-users'],
        ])->assertCreated();
    }

    public function test_actor_cannot_update_role_to_include_permissions_they_lack(): void
    {
        $customRole = Role::create(['name' => 'partial-admin', 'guard_name' => 'web']);
        $customRole->syncPermissions(['assign-roles', 'create-users']);

        $actor = $this->actorWithCustomRole($customRole);
        Sanctum::actingAs($actor);

        $role = Role::findByName('manager', 'web');

        // Actor doesn't have delete-departments
        $this->patchJson("/api/v1/roles/{$role->id}", [
            'permissions' => ['delete-departments'],
        ])->assertForbidden();
    }

    public function test_super_admin_can_create_role_with_any_permissions(): void
    {
        Sanctum::actingAs($this->superAdmin());

        $this->postJson('/api/v1/roles', [
            'name'        => 'almighty',
            'permissions' => ['create-users', 'delete-users', 'assign-roles'],
        ])->assertCreated();
    }

    public function test_super_admin_can_update_any_non_locked_role(): void
    {
        Sanctum::actingAs($this->superAdmin());
        $role = Role::findByName('manager', 'web');

        $this->patchJson("/api/v1/roles/{$role->id}", [
            'permissions' => ['create-teams', 'delete-users'],
        ])->assertOk();
    }

    // ── Unique name enforcement ───────────────────────────────────────────────

    public function test_duplicate_role_name_is_rejected(): void
    {
        Sanctum::actingAs($this->superAdmin());

        $this->postJson('/api/v1/roles', ['name' => 'unique-role', 'permissions' => []])->assertCreated();
        $this->postJson('/api/v1/roles', ['name' => 'unique-role', 'permissions' => []])->assertUnprocessable();
    }

    public function test_cannot_rename_custom_role_to_system_name(): void
    {
        Sanctum::actingAs($this->superAdmin());
        $role = Role::create(['name' => 'to-rename', 'guard_name' => 'web']);

        $this->patchJson("/api/v1/roles/{$role->id}", ['name' => 'manager'])
            ->assertUnprocessable();
    }

    // ── Audit log (Gap 4) ─────────────────────────────────────────────────────

    public function test_role_create_is_audited(): void
    {
        $admin = $this->superAdmin();
        Sanctum::actingAs($admin);

        $this->postJson('/api/v1/roles', ['name' => 'audited-role', 'permissions' => []])
            ->assertCreated();

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $admin->id,
            'action'  => AuditLog::ACTION_ROLE_CREATED,
        ]);
    }

    public function test_role_update_is_audited(): void
    {
        $admin = $this->superAdmin();
        Sanctum::actingAs($admin);
        $role = Role::findByName('manager', 'web');

        $this->patchJson("/api/v1/roles/{$role->id}", ['permissions' => ['create-teams']])
            ->assertOk();

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $admin->id,
            'action'  => AuditLog::ACTION_ROLE_UPDATED,
        ]);
    }

    public function test_role_delete_is_audited(): void
    {
        $admin = $this->superAdmin();
        Sanctum::actingAs($admin);
        $role = Role::create(['name' => 'temp', 'guard_name' => 'web']);

        $this->deleteJson("/api/v1/roles/{$role->id}")->assertNoContent();

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $admin->id,
            'action'  => AuditLog::ACTION_ROLE_DELETED,
        ]);
    }

    // ── Index visibility ──────────────────────────────────────────────────────

    public function test_index_requires_assign_roles_or_privileged_role(): void
    {
        Sanctum::actingAs($this->actorWithRole('user'));

        $this->getJson('/api/v1/roles')->assertForbidden();
    }

    public function test_index_is_accessible_to_company_admin(): void
    {
        Sanctum::actingAs($this->actorWithRole('company-admin'));

        $this->getJson('/api/v1/roles')->assertOk();
    }
}
