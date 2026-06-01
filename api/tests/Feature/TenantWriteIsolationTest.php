<?php

namespace Tests\Feature;

use App\Http\Middleware\AdminOnly;
use App\Models\Branch;
use App\Models\Company;
use App\Models\Team;
use App\Models\User;
use App\Models\UserRoleAssignment;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Write-side tenant isolation: CompanyScope governs what a tenant can READ, but
 * these tests lock down what a non-privileged actor can WRITE — they must not be
 * able to create or move records into a company/branch they cannot access, nor
 * escalate roles via the simple "roles" array on the user endpoint.
 */
class TenantWriteIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        // Lift the dev-phase super-admin-only gate so we can exercise company-admins.
        $this->withoutMiddleware(AdminOnly::class);
    }

    private function company(string $code): Company
    {
        return Company::create([
            'name' => "Company $code", 'code' => $code,
            'is_active' => true, 'enforce_branch_isolation' => false,
        ]);
    }

    /** A company-admin scoped to their own company (the common multi-tenant admin). */
    private function companyAdmin(Company $c): User
    {
        $user = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);
        $role = Role::findByName('company-admin', 'web');
        UserRoleAssignment::create([
            'user_id' => $user->id, 'role_id' => $role->id,
            'scope_type' => 'company', 'scope_id' => $c->id,
        ]);
        $this->assignRole($user, 'company-admin');

        return $user;
    }

    private function superAdmin(Company $c): User
    {
        $user = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);
        $role = Role::findByName('super-admin', 'web');
        UserRoleAssignment::create([
            'user_id' => $user->id, 'role_id' => $role->id,
            'scope_type' => 'global', 'scope_id' => null,
        ]);
        $this->assignRole($user, 'super-admin');

        return $user;
    }

    // ── Users (findings #2 / #3) ───────────────────────────────────────────────

    public function test_company_admin_cannot_create_user_in_another_company(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');
        Sanctum::actingAs($this->companyAdmin($c1));

        $this->postJson('/api/v1/users', [
            'name' => 'Mallory', 'email' => 'mallory@example.com', 'company_id' => $c2->id,
        ])->assertForbidden();

        $this->assertDatabaseMissing('users', ['email' => 'mallory@example.com']);
    }

    public function test_company_admin_can_create_user_in_own_company(): void
    {
        $c1 = $this->company('C1');
        Sanctum::actingAs($this->companyAdmin($c1));

        $this->postJson('/api/v1/users', [
            'name' => 'Alice', 'email' => 'alice@example.com', 'company_id' => $c1->id,
        ])->assertCreated();

        // is_active must default to true (DB default) so the user can authenticate.
        $this->assertDatabaseHas('users', [
            'email' => 'alice@example.com', 'company_id' => $c1->id, 'is_active' => true,
        ]);
    }

    public function test_company_admin_cannot_move_user_to_another_company(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');
        $actor = $this->companyAdmin($c1);
        $target = User::factory()->create(['company_id' => $c1->id, 'is_active' => true]);

        Sanctum::actingAs($actor);

        $this->patchJson("/api/v1/users/{$target->id}", ['company_id' => $c2->id])
            ->assertForbidden();

        $this->assertDatabaseHas('users', ['id' => $target->id, 'company_id' => $c1->id]);
    }

    public function test_company_admin_cannot_attach_foreign_branch_to_user(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');
        $foreignBranch = Branch::create([
            'company_id' => $c2->id, 'name' => 'B2', 'code' => 'B2', 'is_active' => true,
        ]);
        Sanctum::actingAs($this->companyAdmin($c1));

        $this->postJson('/api/v1/users', [
            'name' => 'Bob', 'email' => 'bob@example.com',
            'company_id' => $c1->id, 'branch_id' => $foreignBranch->id,
        ])->assertForbidden();

        $this->assertDatabaseMissing('users', ['email' => 'bob@example.com']);
    }

    public function test_company_admin_cannot_orphan_user_by_nulling_company(): void
    {
        $c1 = $this->company('C1');
        $actor = $this->companyAdmin($c1);
        $target = User::factory()->create(['company_id' => $c1->id, 'is_active' => true]);

        Sanctum::actingAs($actor);

        $this->patchJson("/api/v1/users/{$target->id}", ['company_id' => null])
            ->assertForbidden();

        $this->assertDatabaseHas('users', ['id' => $target->id, 'company_id' => $c1->id]);
    }

    // ── Branch / Department / Team (finding #6) ────────────────────────────────

    public function test_company_admin_cannot_create_branch_in_another_company(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');
        Sanctum::actingAs($this->companyAdmin($c1));

        $this->postJson('/api/v1/branches', [
            'name' => 'Sneaky', 'code' => 'SNK', 'company_id' => $c2->id,
        ])->assertForbidden();

        $this->assertDatabaseMissing('branches', ['code' => 'SNK']);
    }

    public function test_company_admin_cannot_create_department_in_another_company(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');
        Sanctum::actingAs($this->companyAdmin($c1));

        $this->postJson('/api/v1/departments', [
            'name' => 'Ops', 'code' => 'OPS', 'company_id' => $c2->id,
        ])->assertForbidden();

        $this->assertDatabaseMissing('departments', ['code' => 'OPS']);
    }

    public function test_company_admin_cannot_create_team_in_another_company(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');
        Sanctum::actingAs($this->companyAdmin($c1));

        $this->postJson('/api/v1/teams', [
            'name' => 'Rogue Team', 'company_id' => $c2->id,
        ])->assertForbidden();

        $this->assertDatabaseMissing('teams', ['name' => 'Rogue Team']);
    }

    public function test_company_admin_can_create_branch_in_own_company(): void
    {
        $c1 = $this->company('C1');
        Sanctum::actingAs($this->companyAdmin($c1));

        $this->postJson('/api/v1/branches', [
            'name' => 'HQ', 'code' => 'HQ', 'company_id' => $c1->id,
        ])->assertCreated();

        $this->assertDatabaseHas('branches', ['code' => 'HQ', 'company_id' => $c1->id]);
    }

    // ── Role escalation via the user "roles" array (finding #7) ────────────────

    public function test_company_admin_cannot_escalate_role_via_user_roles_array(): void
    {
        $c1 = $this->company('C1');
        Sanctum::actingAs($this->companyAdmin($c1));

        // company-admin (level 70) may not grant company-admin (70) — not strictly below.
        $this->postJson('/api/v1/users', [
            'name' => 'Climber', 'email' => 'climber@example.com',
            'company_id' => $c1->id, 'roles' => ['company-admin'],
        ])->assertForbidden();

        // The whole create is rolled back — no orphan user without its roles.
        $this->assertDatabaseMissing('users', ['email' => 'climber@example.com']);
    }

    public function test_company_admin_cannot_grant_locked_role_via_user_roles_array(): void
    {
        $c1 = $this->company('C1');
        Sanctum::actingAs($this->companyAdmin($c1));

        $this->postJson('/api/v1/users', [
            'name' => 'Sneaky Admin', 'email' => 'sa@example.com',
            'company_id' => $c1->id, 'roles' => ['super-admin'],
        ])->assertForbidden();

        $this->assertDatabaseMissing('users', ['email' => 'sa@example.com']);
    }

    public function test_company_admin_can_assign_subordinate_role_via_user_roles_array(): void
    {
        $c1 = $this->company('C1');
        Sanctum::actingAs($this->companyAdmin($c1));

        $this->postJson('/api/v1/users', [
            'name' => 'Worker', 'email' => 'worker@example.com',
            'company_id' => $c1->id, 'roles' => ['user'],
        ])->assertCreated();

        $this->assertDatabaseHas('users', ['email' => 'worker@example.com', 'company_id' => $c1->id]);
    }

    // ── Privileged actors stay unrestricted ────────────────────────────────────

    public function test_super_admin_can_create_user_in_any_company(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');
        Sanctum::actingAs($this->superAdmin($c1));

        $this->postJson('/api/v1/users', [
            'name' => 'Made', 'email' => 'made@example.com', 'company_id' => $c2->id,
        ])->assertCreated();

        $this->assertDatabaseHas('users', ['email' => 'made@example.com', 'company_id' => $c2->id]);
    }

    // ── Flat-role sync preserves other scopes (applyRoles regression) ──────────

    public function test_user_form_role_sync_preserves_roles_held_in_other_scopes(): void
    {
        $c1 = $this->company('C1');
        $admin = $this->superAdmin($c1);
        $target = User::factory()->create(['company_id' => $c1->id, 'is_active' => true]);

        // A branch-scoped 'manager' assignment made out-of-band (e.g. via the dedicated endpoint).
        $branch = Branch::create(['company_id' => $c1->id, 'name' => 'B1', 'code' => 'B1', 'is_active' => true]);
        $managerRole = Role::findByName('manager', 'web');
        UserRoleAssignment::create([
            'user_id' => $target->id, 'role_id' => $managerRole->id,
            'scope_type' => 'branch', 'scope_id' => $branch->id,
        ]);
        $target->syncFlatRolesFromAssignments();

        Sanctum::actingAs($admin);

        // Editing the company-scoped roles via the simple form must NOT drop the branch role.
        $this->patchJson("/api/v1/users/{$target->id}", ['roles' => ['viewer']])
            ->assertOk();

        $fresh = $target->fresh();
        $this->assertTrue($fresh->hasRole('viewer'), 'company-scoped viewer role applied');
        $this->assertTrue($fresh->hasRole('manager'), 'branch-scoped manager role preserved');
    }

    // ── Branch access grants (verification follow-up) ──────────────────────────

    public function test_company_admin_cannot_grant_access_to_foreign_branch(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');
        $foreignBranch = Branch::create([
            'company_id' => $c2->id, 'name' => 'B2', 'code' => 'B2', 'is_active' => true,
        ]);
        $actor = $this->companyAdmin($c1);

        Sanctum::actingAs($actor);

        $this->postJson("/api/v1/companies/{$c1->id}/branch-access-grants", [
            'branch_id' => $foreignBranch->id, 'grantee_type' => 'user', 'grantee_id' => $actor->id,
        ])->assertStatus(422);

        $this->assertDatabaseMissing('branch_access_grants', ['branch_id' => $foreignBranch->id]);
    }

    public function test_company_admin_can_grant_access_to_own_branch(): void
    {
        $c1 = $this->company('C1');
        $branch = Branch::create([
            'company_id' => $c1->id, 'name' => 'B1', 'code' => 'B1', 'is_active' => true,
        ]);
        $actor = $this->companyAdmin($c1);

        Sanctum::actingAs($actor);

        $this->postJson("/api/v1/companies/{$c1->id}/branch-access-grants", [
            'branch_id' => $branch->id, 'grantee_type' => 'user', 'grantee_id' => $actor->id,
        ])->assertCreated();

        $this->assertDatabaseHas('branch_access_grants', [
            'branch_id' => $branch->id, 'company_id' => $c1->id,
        ]);
    }

    // ── Team membership integrity (verification follow-up) ─────────────────────

    public function test_can_add_member_from_same_company_to_team(): void
    {
        $c1 = $this->company('C1');
        $actor = $this->companyAdmin($c1);
        $team = Team::create(['company_id' => $c1->id, 'name' => 'Team A', 'is_active' => true]);
        $member = User::factory()->create(['company_id' => $c1->id, 'is_active' => true]);

        Sanctum::actingAs($actor);

        $this->postJson("/api/v1/teams/{$team->id}/members", ['user_id' => $member->id])
            ->assertCreated();

        $this->assertDatabaseHas('team_members', ['team_id' => $team->id, 'user_id' => $member->id]);
    }

    public function test_multi_company_admin_cannot_add_foreign_company_user_to_team(): void
    {
        $cA = $this->company('CA');
        $cB = $this->company('CB');

        // Multi-company admin: company-admin in A, also company-scoped to B (can see B's users).
        $actor = $this->companyAdmin($cA);
        $companyAdminRoleId = Role::findByName('company-admin', 'web')->id;
        UserRoleAssignment::create([
            'user_id' => $actor->id, 'role_id' => $companyAdminRoleId,
            'scope_type' => 'company', 'scope_id' => $cB->id,
        ]);

        $team = Team::create(['company_id' => $cA->id, 'name' => 'Team A', 'is_active' => true]);
        $userB = User::factory()->create(['company_id' => $cB->id, 'is_active' => true]);

        Sanctum::actingAs($actor);

        $this->postJson("/api/v1/teams/{$team->id}/members", ['user_id' => $userB->id])
            ->assertForbidden();

        $this->assertDatabaseMissing('team_members', ['team_id' => $team->id, 'user_id' => $userB->id]);
    }
}
