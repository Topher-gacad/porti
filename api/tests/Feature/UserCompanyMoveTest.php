<?php

namespace Tests\Feature;

use App\Core\Tenancy\CompanyScope;
use App\Http\Middleware\AdminOnly;
use App\Models\AuditLog;
use App\Models\Branch;
use App\Models\Company;
use App\Models\User;
use App\Models\UserRoleAssignment;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Phase 1: a between-company move revokes the old company's scoped role assignments and
 * invalidates tokens (architecture §8), plus the Unassigned review queue.
 */
class UserCompanyMoveTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        // Test the controller's own guards directly, not the dev-phase admin-only gate.
        $this->withoutMiddleware(AdminOnly::class);
    }

    private function company(string $code): Company
    {
        return Company::create(['name' => "Company $code", 'code' => $code, 'is_active' => true]);
    }

    private function superAdmin(Company $c): User
    {
        $user = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);
        $this->assignRole($user, 'super-admin');

        return $user;
    }

    private function assign(User $user, string $role, string $scopeType, ?int $scopeId): void
    {
        UserRoleAssignment::create([
            'user_id' => $user->id,
            'role_id' => Role::findByName($role, 'web')->id,
            'scope_type' => $scopeType,
            'scope_id' => $scopeId,
        ]);
    }

    public function test_move_revokes_old_company_scoped_assignments_and_tokens(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');
        $branch = Branch::withoutGlobalScope(CompanyScope::class)
            ->create(['company_id' => $c1->id, 'name' => 'HQ', 'code' => 'HQ']);

        $admin = $this->superAdmin($c2);
        $target = User::factory()->create(['company_id' => $c1->id, 'is_active' => true]);

        $this->assign($target, 'user', UserRoleAssignment::SCOPE_GLOBAL, null);
        $this->assign($target, 'manager', UserRoleAssignment::SCOPE_COMPANY, $c1->id);
        $this->assign($target, 'branch-manager', UserRoleAssignment::SCOPE_BRANCH, $branch->id);
        $target->createToken('login');

        Sanctum::actingAs($admin);
        $this->patchJson("/api/v1/users/{$target->id}", ['company_id' => $c2->id])->assertOk();

        // Old company- and branch-scoped grants are gone; the global grant survives.
        $this->assertDatabaseMissing('user_role_assignments', [
            'user_id' => $target->id, 'scope_type' => 'company', 'scope_id' => $c1->id,
        ]);
        $this->assertDatabaseMissing('user_role_assignments', [
            'user_id' => $target->id, 'scope_type' => 'branch', 'scope_id' => $branch->id,
        ]);
        $this->assertDatabaseHas('user_role_assignments', [
            'user_id' => $target->id, 'scope_type' => 'global',
        ]);

        $this->assertCount(0, $target->fresh()->tokens);
        $this->assertDatabaseHas('audit_logs', [
            'action' => AuditLog::ACTION_USER_COMPANY_CHANGED,
            'target_id' => $target->id,
        ]);
    }

    public function test_unassigned_queue_lists_company_less_users_for_privileged(): void
    {
        $c1 = $this->company('C1');
        $admin = $this->superAdmin($c1);

        $stray = User::factory()->create(['company_id' => null, 'is_active' => true]);
        User::factory()->create(['company_id' => $c1->id, 'is_active' => true]);

        Sanctum::actingAs($admin);
        $ids = collect($this->getJson('/api/v1/users/unassigned')->assertOk()->json('data'))
            ->pluck('id')->all();

        $this->assertContains($stray->id, $ids);
        $this->assertCount(1, $ids);
    }

    public function test_unassigned_queue_is_forbidden_for_non_privileged(): void
    {
        $c1 = $this->company('C1');
        $actor = User::factory()->create(['company_id' => $c1->id, 'is_active' => true]);
        $this->assignRole($actor, 'company-admin');

        Sanctum::actingAs($actor);
        $this->getJson('/api/v1/users/unassigned')->assertForbidden();
    }

    public function test_assigning_an_unassigned_user_records_the_change(): void
    {
        $c1 = $this->company('C1');
        $admin = $this->superAdmin($c1);
        $stray = User::factory()->create(['company_id' => null, 'is_active' => true]);

        Sanctum::actingAs($admin);
        $this->patchJson("/api/v1/users/{$stray->id}", ['company_id' => $c1->id])->assertOk();

        $this->assertSame($c1->id, $stray->fresh()->company_id);
        $this->assertDatabaseHas('audit_logs', [
            'action' => AuditLog::ACTION_USER_COMPANY_CHANGED,
            'target_id' => $stray->id,
        ]);
    }
}
