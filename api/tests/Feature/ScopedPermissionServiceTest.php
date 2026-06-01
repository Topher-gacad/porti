<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use App\Models\UserRoleAssignment;
use App\Services\ScopedPermissionService;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ScopedPermissionServiceTest extends TestCase
{
    use RefreshDatabase;

    private ScopedPermissionService $sps;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        $this->sps = app(ScopedPermissionService::class);
    }

    private function company(string $code = 'CO'): Company
    {
        return Company::create(['name' => "Company $code", 'code' => $code, 'is_active' => true, 'enforce_branch_isolation' => false]);
    }

    private function assign(User $user, string $roleName, string $scopeType = 'global', ?int $scopeId = null): void
    {
        $role = Role::findByName($roleName, 'web');
        UserRoleAssignment::create([
            'user_id' => $user->id,
            'role_id' => $role->id,
            'scope_type' => $scopeType,
            'scope_id' => $scopeId,
        ]);
    }

    // ── Fallback ──────────────────────────────────────────────────────────────

    public function test_user_with_no_assignments_falls_back_to_spatie_flat_roles(): void
    {
        $user = User::factory()->create();
        $this->assignRole($user, 'manager'); // Spatie only, no UserRoleAssignment

        $this->assertTrue($this->sps->can($user, 'create-teams'));
        $this->assertFalse($this->sps->can($user, 'create-users'));
    }

    public function test_all_permissions_falls_back_to_spatie_when_no_assignments(): void
    {
        $user = User::factory()->create();
        $this->assignRole($user, 'manager');

        $perms = $this->sps->allPermissions($user);
        $this->assertContains('create-teams', $perms);
        $this->assertNotContains('create-users', $perms);
    }

    // ── Global scope ──────────────────────────────────────────────────────────

    public function test_global_assignment_covers_any_context(): void
    {
        $user = User::factory()->create();
        $this->assign($user, 'company-admin', 'global');

        $this->assertTrue($this->sps->can($user, 'create-users'));
        $this->assertTrue($this->sps->can($user, 'create-users', ['company_id' => 999]));
        $this->assertTrue($this->sps->can($user, 'create-users', ['branch_id' => 5]));
    }

    public function test_global_assignment_does_not_grant_unowned_permissions(): void
    {
        $user = User::factory()->create();
        $this->assign($user, 'manager', 'global'); // manager only has team perms

        $this->assertFalse($this->sps->can($user, 'create-users'));
    }

    // ── Company scope ─────────────────────────────────────────────────────────

    public function test_company_scope_only_covers_matching_company(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');
        $user = User::factory()->create(['company_id' => $c1->id]);
        $this->assign($user, 'company-admin', 'company', $c1->id);

        $this->assertTrue($this->sps->can($user, 'create-users', ['company_id' => $c1->id]));
        $this->assertFalse($this->sps->can($user, 'create-users', ['company_id' => $c2->id]));
        $this->assertFalse($this->sps->can($user, 'create-users')); // no context
    }

    public function test_company_scope_covers_full_resource_context_from_that_company(): void
    {
        $c1 = $this->company('C1');
        $user = User::factory()->create(['company_id' => $c1->id]);
        $this->assign($user, 'company-admin', 'company', $c1->id);

        // Policies pass company_id + branch_id + dept_id — company scope should still match
        $this->assertTrue($this->sps->can($user, 'create-users', [
            'company_id' => $c1->id,
            'branch_id' => 5,
            'department_id' => 3,
        ]));
    }

    // ── Branch scope ──────────────────────────────────────────────────────────

    public function test_branch_scope_only_covers_matching_branch(): void
    {
        $c1 = $this->company('C1');
        $user = User::factory()->create(['company_id' => $c1->id]);
        $this->assign($user, 'branch-manager', 'branch', 5);

        $this->assertTrue($this->sps->can($user, 'create-users', ['company_id' => $c1->id, 'branch_id' => 5]));
        $this->assertFalse($this->sps->can($user, 'create-users', ['company_id' => $c1->id, 'branch_id' => 6]));
    }

    // ── String context ids (MySQL returns FK columns as strings) ───────────────

    public function test_company_scope_matches_string_context_id(): void
    {
        $c1 = $this->company('C1');
        $user = User::factory()->create(['company_id' => $c1->id]);
        $this->assign($user, 'company-admin', 'company', $c1->id);

        // A strict === between int scope_id and a string context id would fail here.
        $this->assertTrue($this->sps->can($user, 'create-users', ['company_id' => (string) $c1->id]));
        $this->assertFalse($this->sps->can($user, 'create-users', ['company_id' => (string) ($c1->id + 999)]));
    }

    public function test_branch_scope_matches_string_context_id(): void
    {
        $c1 = $this->company('C1');
        $user = User::factory()->create(['company_id' => $c1->id]);
        $this->assign($user, 'branch-manager', 'branch', 5);

        $this->assertTrue($this->sps->can($user, 'create-users', ['company_id' => (string) $c1->id, 'branch_id' => '5']));
        $this->assertFalse($this->sps->can($user, 'create-users', ['company_id' => (string) $c1->id, 'branch_id' => '6']));
    }

    // ── allPermissions ────────────────────────────────────────────────────────

    public function test_all_permissions_unions_across_multiple_assignments(): void
    {
        $user = User::factory()->create();
        $this->assign($user, 'branch-manager', 'global'); // has create-users
        $this->assign($user, 'manager', 'global');         // has create-teams

        $perms = $this->sps->allPermissions($user);

        $this->assertContains('create-users', $perms);
        $this->assertContains('create-teams', $perms);
    }

    // ── allRoles ──────────────────────────────────────────────────────────────

    public function test_all_roles_deduplicates_same_role_across_scopes(): void
    {
        $user = User::factory()->create();
        $role = Role::findByName('manager', 'web');
        UserRoleAssignment::create(['user_id' => $user->id, 'role_id' => $role->id, 'scope_type' => 'global', 'scope_id' => null]);
        UserRoleAssignment::create(['user_id' => $user->id, 'role_id' => $role->id, 'scope_type' => 'company', 'scope_id' => 1]);

        $roles = $this->sps->allRoles($user);

        $this->assertCount(1, array_filter($roles, fn ($r) => $r === 'manager'));
    }
}
