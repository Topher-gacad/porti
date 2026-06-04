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

class RoleAssignmentControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        // Skip the dev-phase admin-only gate so we can test with non-super-admin actors
        $this->withoutMiddleware(AdminOnly::class);
    }

    private function company(): Company
    {
        return Company::create(['name' => 'Acme', 'code' => 'ACM', 'is_active' => true, 'enforce_branch_isolation' => false]);
    }

    private function userWithRole(Company $c, string $roleName): User
    {
        $user = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);
        $role = Role::findByName($roleName, 'web');
        UserRoleAssignment::create(['user_id' => $user->id, 'role_id' => $role->id, 'scope_type' => 'global', 'scope_id' => null]);
        $this->assignRole($user, $roleName);

        return $user;
    }

    // ── Auth ──────────────────────────────────────────────────────────────────

    public function test_unauthenticated_request_is_rejected(): void
    {
        $target = User::factory()->create();
        $role = Role::findByName('user', 'web');

        $this->postJson("/api/v1/users/{$target->id}/role-assignments", [
            'role_id' => $role->id, 'scope_type' => 'global',
        ])->assertUnauthorized();
    }

    public function test_user_without_assign_roles_permission_cannot_assign(): void
    {
        $c = $this->company();
        $actor = $this->userWithRole($c, 'manager'); // manager has no assign-roles
        $target = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);
        $role = Role::findByName('user', 'web');

        Sanctum::actingAs($actor);
        $this->postJson("/api/v1/users/{$target->id}/role-assignments", [
            'role_id' => $role->id, 'scope_type' => 'global',
        ])->assertForbidden();
    }

    // ── Privilege escalation (Gap 1) ──────────────────────────────────────────

    public function test_actor_cannot_assign_role_at_own_privilege_level(): void
    {
        $c = $this->company();
        $actor = $this->userWithRole($c, 'company-admin'); // level 70
        $target = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);

        Sanctum::actingAs($actor);
        $companyAdminRole = Role::findByName('company-admin', 'web');

        $this->postJson("/api/v1/users/{$target->id}/role-assignments", [
            'role_id' => $companyAdminRole->id, 'scope_type' => 'global',
        ])->assertForbidden();
    }

    public function test_actor_can_assign_role_strictly_below_own_level(): void
    {
        $c = $this->company();
        $actor = $this->userWithRole($c, 'company-admin'); // level 70
        $target = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);

        Sanctum::actingAs($actor);
        $branchManagerRole = Role::findByName('branch-manager', 'web'); // level 50

        // Company scope on the actor's own company — non-admins cannot grant global scope.
        $this->postJson("/api/v1/users/{$target->id}/role-assignments", [
            'role_id' => $branchManagerRole->id, 'scope_type' => 'company', 'scope_id' => $c->id,
        ])->assertCreated();
    }

    public function test_only_super_admin_can_assign_super_admin_role(): void
    {
        $c = $this->company();
        $actor = $this->userWithRole($c, 'company-admin');
        $target = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);

        Sanctum::actingAs($actor);
        $superAdminRole = Role::findByName('super-admin', 'web');

        $this->postJson("/api/v1/users/{$target->id}/role-assignments", [
            'role_id' => $superAdminRole->id, 'scope_type' => 'global',
        ])->assertForbidden();
    }

    public function test_super_admin_can_assign_any_role(): void
    {
        $c = $this->company();
        $admin = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);
        $role = Role::findByName('super-admin', 'web');
        UserRoleAssignment::create(['user_id' => $admin->id, 'role_id' => $role->id, 'scope_type' => 'global', 'scope_id' => null]);
        $this->assignRole($admin, 'super-admin');

        $target = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);

        Sanctum::actingAs($admin);
        $companyAdminRole = Role::findByName('company-admin', 'web');

        $this->postJson("/api/v1/users/{$target->id}/role-assignments", [
            'role_id' => $companyAdminRole->id, 'scope_type' => 'global',
        ])->assertCreated();
    }

    // ── Global scope is privileged-only (finding #1) ──────────────────────────

    public function test_company_admin_cannot_grant_global_scope(): void
    {
        $c = $this->company();
        $actor = $this->userWithRole($c, 'company-admin');
        $target = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);

        Sanctum::actingAs($actor);
        $userRole = Role::findByName('user', 'web');

        $this->postJson("/api/v1/users/{$target->id}/role-assignments", [
            'role_id' => $userRole->id, 'scope_type' => 'global',
        ])->assertForbidden();

        $this->assertDatabaseMissing('user_role_assignments', [
            'user_id' => $target->id, 'role_id' => $userRole->id, 'scope_type' => 'global',
        ]);
    }

    public function test_super_admin_can_grant_global_scope(): void
    {
        $c = $this->company();
        $actor = $this->userWithRole($c, 'super-admin');
        $target = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);

        Sanctum::actingAs($actor);
        $userRole = Role::findByName('user', 'web');

        $this->postJson("/api/v1/users/{$target->id}/role-assignments", [
            'role_id' => $userRole->id, 'scope_type' => 'global',
        ])->assertCreated();
    }

    // ── Scope validation (Gap 3) ──────────────────────────────────────────────

    public function test_actor_cannot_grant_company_scope_for_company_they_dont_belong_to(): void
    {
        $c1 = $this->company();
        $c2 = Company::create(['name' => 'Other', 'code' => 'OTH', 'is_active' => true, 'enforce_branch_isolation' => false]);

        $actor = $this->userWithRole($c1, 'company-admin');
        $target = User::factory()->create(['company_id' => $c1->id, 'is_active' => true]);

        Sanctum::actingAs($actor);
        $userRole = Role::findByName('user', 'web');

        $this->postJson("/api/v1/users/{$target->id}/role-assignments", [
            'role_id' => $userRole->id,
            'scope_type' => 'company',
            'scope_id' => $c2->id,
        ])->assertForbidden();
    }

    public function test_actor_can_grant_company_scope_for_own_company(): void
    {
        $c = $this->company();
        $actor = $this->userWithRole($c, 'company-admin');
        $target = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);

        Sanctum::actingAs($actor);
        $userRole = Role::findByName('user', 'web');

        $this->postJson("/api/v1/users/{$target->id}/role-assignments", [
            'role_id' => $userRole->id,
            'scope_type' => 'company',
            'scope_id' => $c->id,
        ])->assertCreated();
    }

    // ── Duplicate prevention (Gap 9) ─────────────────────────────────────────

    public function test_duplicate_company_assignment_is_rejected(): void
    {
        $c = $this->company();
        $actor = $this->userWithRole($c, 'company-admin');
        $target = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);

        Sanctum::actingAs($actor);
        $userRole = Role::findByName('user', 'web');
        $payload = ['role_id' => $userRole->id, 'scope_type' => 'company', 'scope_id' => $c->id];

        $this->postJson("/api/v1/users/{$target->id}/role-assignments", $payload)->assertCreated();
        $this->postJson("/api/v1/users/{$target->id}/role-assignments", $payload)->assertUnprocessable();
    }

    public function test_same_role_different_scopes_are_allowed(): void
    {
        $c = $this->company();
        // Super-admin actor: only privileged actors may grant the global scope.
        $actor = $this->userWithRole($c, 'super-admin');
        $target = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);

        Sanctum::actingAs($actor);
        $userRole = Role::findByName('user', 'web');

        $this->postJson("/api/v1/users/{$target->id}/role-assignments", [
            'role_id' => $userRole->id, 'scope_type' => 'global',
        ])->assertCreated();

        // Same role but different scope — should be allowed
        $this->postJson("/api/v1/users/{$target->id}/role-assignments", [
            'role_id' => $userRole->id,
            'scope_type' => 'company',
            'scope_id' => $c->id,
        ])->assertCreated();
    }

    // ── Token invalidation (Gap 5) ────────────────────────────────────────────

    public function test_target_tokens_are_revoked_after_assignment(): void
    {
        $c = $this->company();
        $actor = $this->userWithRole($c, 'company-admin');
        $target = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);
        $target->createToken('login');
        $this->assertCount(1, $target->fresh()->tokens);

        Sanctum::actingAs($actor);
        $userRole = Role::findByName('user', 'web');

        $this->postJson("/api/v1/users/{$target->id}/role-assignments", [
            'role_id' => $userRole->id, 'scope_type' => 'company', 'scope_id' => $c->id,
        ])->assertCreated();

        $this->assertCount(0, $target->fresh()->tokens);
    }

    public function test_target_tokens_are_revoked_after_revocation(): void
    {
        $c = $this->company();
        $actor = $this->userWithRole($c, 'company-admin');
        $target = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);

        $userRole = Role::findByName('user', 'web');
        $assignment = UserRoleAssignment::create([
            'user_id' => $target->id,
            'role_id' => $userRole->id,
            'scope_type' => 'global',
            'scope_id' => null,
            'assigned_by' => $actor->id,
        ]);
        $this->assignRole($target, 'user');
        $target->createToken('login');

        Sanctum::actingAs($actor);

        $this->deleteJson("/api/v1/users/{$target->id}/role-assignments/{$assignment->id}")
            ->assertNoContent();

        $this->assertCount(0, $target->fresh()->tokens);
    }

    // ── Audit log (Gap 4) ─────────────────────────────────────────────────────

    public function test_assignment_is_written_to_audit_log(): void
    {
        $c = $this->company();
        $actor = $this->userWithRole($c, 'company-admin');
        $target = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);

        Sanctum::actingAs($actor);
        $userRole = Role::findByName('user', 'web');

        $this->postJson("/api/v1/users/{$target->id}/role-assignments", [
            'role_id' => $userRole->id, 'scope_type' => 'company', 'scope_id' => $c->id,
        ])->assertCreated();

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $actor->id,
            'action' => AuditLog::ACTION_ROLE_ASSIGNED,
        ]);
    }

    public function test_revocation_is_written_to_audit_log(): void
    {
        $c = $this->company();
        $actor = $this->userWithRole($c, 'company-admin');
        $target = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);

        $userRole = Role::findByName('user', 'web');
        $assignment = UserRoleAssignment::create([
            'user_id' => $target->id,
            'role_id' => $userRole->id,
            'scope_type' => 'global',
            'scope_id' => null,
            'assigned_by' => $actor->id,
        ]);
        $this->assignRole($target, 'user');

        Sanctum::actingAs($actor);

        $this->deleteJson("/api/v1/users/{$target->id}/role-assignments/{$assignment->id}")
            ->assertNoContent();

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $actor->id,
            'action' => AuditLog::ACTION_ROLE_REVOKED,
        ]);
    }

    // ── Ownership guard ───────────────────────────────────────────────────────

    public function test_cannot_delete_assignment_belonging_to_different_user(): void
    {
        $c = $this->company();
        $actor = $this->userWithRole($c, 'company-admin');
        $targetA = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);
        $targetB = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);

        $userRole = Role::findByName('user', 'web');
        $assignment = UserRoleAssignment::create([
            'user_id' => $targetA->id, 'role_id' => $userRole->id,
            'scope_type' => 'global', 'scope_id' => null,
        ]);
        $this->assignRole($targetA, 'user');

        Sanctum::actingAs($actor);

        // Pass targetB's ID but assignment belongs to targetA
        $this->deleteJson("/api/v1/users/{$targetB->id}/role-assignments/{$assignment->id}")
            ->assertNotFound();
    }
}
