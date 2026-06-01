<?php

namespace Tests\Feature;

use App\Http\Middleware\AdminOnly;
use App\Models\AuditLog;
use App\Models\Branch;
use App\Models\Company;
use App\Models\User;
use App\Models\UserRoleAssignment;
use App\Services\AuditLogger;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    private function company(string $code = 'CO'): Company
    {
        return Company::create([
            'name' => "Company $code", 'code' => $code, 'is_active' => true, 'enforce_branch_isolation' => false,
        ]);
    }

    // ── #9: system events are recorded, not silently dropped ───────────────────

    public function test_system_action_without_authenticated_user_is_recorded(): void
    {
        app(AuditLogger::class)->log('test.system.action');

        $this->assertDatabaseHas('audit_logs', ['action' => 'test.system.action', 'user_id' => null]);
    }

    public function test_company_is_derived_from_target_when_there_is_no_actor(): void
    {
        $company = $this->company();
        $branch = Branch::create(['company_id' => $company->id, 'name' => 'B', 'code' => 'B', 'is_active' => true]);

        // Branch::create fired the observer with no authenticated user.
        $this->assertDatabaseHas('audit_logs', [
            'action' => AuditLog::ACTION_BRANCH_CREATED,
            'target_type' => 'branch',
            'target_id' => $branch->id,
            'company_id' => $company->id,
            'user_id' => null,
        ]);
    }

    // ── #53: created_at is set explicitly, never left to the DB default ────────

    public function test_audit_entry_has_created_at(): void
    {
        app(AuditLogger::class)->log('test.timestamped');

        $this->assertNotNull(AuditLog::where('action', 'test.timestamped')->first()->created_at);
    }

    // ── #39: a role assignment writes exactly one audit entry (not two) ────────

    public function test_role_assignment_is_logged_exactly_once(): void
    {
        $this->withoutMiddleware(AdminOnly::class);
        $company = $this->company();

        $actor = User::factory()->create(['company_id' => $company->id, 'is_active' => true]);
        UserRoleAssignment::create([
            'user_id' => $actor->id, 'role_id' => Role::findByName('company-admin', 'web')->id,
            'scope_type' => 'company', 'scope_id' => $company->id,
        ]);
        $this->assignRole($actor, 'company-admin');
        $target = User::factory()->create(['company_id' => $company->id, 'is_active' => true]);

        Sanctum::actingAs($actor);
        $this->postJson("/api/v1/users/{$target->id}/role-assignments", [
            'role_id' => Role::findByName('user', 'web')->id, 'scope_type' => 'company', 'scope_id' => $company->id,
        ])->assertCreated();

        $count = AuditLog::where('action', AuditLog::ACTION_ROLE_ASSIGNED)
            ->where('target_id', $target->id)
            ->count();
        $this->assertSame(1, $count);
    }

    // ── #39 regression: replacing roles via the user endpoint logs the revoke ──

    public function test_replacing_roles_via_user_endpoint_logs_revocation(): void
    {
        $this->withoutMiddleware(AdminOnly::class);
        $company = $this->company();

        // Super-admin actor (privileged: may freely reassign).
        $actor = User::factory()->create(['company_id' => $company->id, 'is_active' => true]);
        UserRoleAssignment::create([
            'user_id' => $actor->id, 'role_id' => Role::findByName('super-admin', 'web')->id,
            'scope_type' => 'global', 'scope_id' => null,
        ]);
        $this->assignRole($actor, 'super-admin');

        // Target already holds a company-scoped 'manager' role.
        $target = User::factory()->create(['company_id' => $company->id, 'is_active' => true]);
        UserRoleAssignment::create([
            'user_id' => $target->id, 'role_id' => Role::findByName('manager', 'web')->id,
            'scope_type' => 'company', 'scope_id' => $company->id,
        ]);

        Sanctum::actingAs($actor);

        // Replacing the roles must revoke the company-scoped 'manager' — and that
        // revocation goes through applyRoles' delete path, which must be audited.
        $this->patchJson("/api/v1/users/{$target->id}", ['roles' => ['user']])->assertOk();

        $this->assertDatabaseHas('audit_logs', [
            'action' => AuditLog::ACTION_ROLE_REVOKED,
            'target_id' => $target->id,
        ]);
    }

    // ── #51: soft-delete restore / forceDelete are audited ─────────────────────

    public function test_branch_restore_and_force_delete_are_audited(): void
    {
        $company = $this->company();
        $branch = Branch::create(['company_id' => $company->id, 'name' => 'B', 'code' => 'B', 'is_active' => true]);
        $id = $branch->id;

        $branch->delete();
        $branch->restore();
        $branch->forceDelete();

        $this->assertDatabaseHas('audit_logs', ['action' => AuditLog::ACTION_BRANCH_RESTORED, 'target_id' => $id]);
        $this->assertDatabaseHas('audit_logs', ['action' => AuditLog::ACTION_BRANCH_FORCE_DELETED, 'target_id' => $id]);
    }
}
