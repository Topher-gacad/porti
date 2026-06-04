<?php

namespace Tests\Feature;

use App\Core\Tenancy\CompanyScope;
use App\Http\Middleware\AdminOnly;
use App\Models\AuditLog;
use App\Models\Branch;
use App\Models\Company;
use App\Models\CrossTenantGrant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Phase 1: thin CRUD for cross-company access grants. Per the locked plan (decision #9)
 * the surface is super-admin/developer only — enforced by CrossTenantGrantPolicy
 * independently of the dev-phase admin-only gate (which is disabled here).
 */
class CrossTenantGrantControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        $this->withoutMiddleware(AdminOnly::class);
    }

    private function company(string $code): Company
    {
        return Company::create(['name' => "Company $code", 'code' => $code, 'is_active' => true]);
    }

    private function actor(Company $c, string $role): User
    {
        $user = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);
        $this->assignRole($user, $role);

        return $user;
    }

    public function test_unauthenticated_is_rejected(): void
    {
        $this->getJson('/api/v1/cross-tenant-grants')->assertUnauthorized();
    }

    public function test_company_admin_cannot_list_or_create(): void
    {
        $c = $this->company('C1');
        $actor = $this->actor($c, 'company-admin');
        $grantee = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);

        Sanctum::actingAs($actor);

        $this->getJson('/api/v1/cross-tenant-grants')->assertForbidden();
        $this->postJson('/api/v1/cross-tenant-grants', [
            'grantee_type' => 'user',
            'grantee_id' => $grantee->id,
            'target_company_id' => $c->id,
        ])->assertForbidden();
    }

    public function test_super_admin_can_create_grant_and_it_is_audited(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');
        $actor = $this->actor($c1, 'super-admin');
        $grantee = User::factory()->create(['company_id' => $c1->id, 'is_active' => true]);

        Sanctum::actingAs($actor);

        $this->postJson('/api/v1/cross-tenant-grants', [
            'grantee_type' => 'user',
            'grantee_id' => $grantee->id,
            'target_company_id' => $c2->id,
            'reason' => 'Shared services audit',
        ])->assertCreated()
            ->assertJsonPath('data.target_company.id', $c2->id);

        $this->assertDatabaseHas('cross_tenant_grants', [
            'grantee_type' => 'user',
            'grantee_id' => $grantee->id,
            'target_company_id' => $c2->id,
            'granted_by' => $actor->id,
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $actor->id,
            'action' => AuditLog::ACTION_CROSS_GRANT_CREATED,
        ]);
    }

    public function test_developer_can_create_grant(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');
        $actor = $this->actor($c1, 'developer');
        $grantee = User::factory()->create(['company_id' => $c1->id, 'is_active' => true]);

        Sanctum::actingAs($actor);

        $this->postJson('/api/v1/cross-tenant-grants', [
            'grantee_type' => 'user',
            'grantee_id' => $grantee->id,
            'target_company_id' => $c2->id,
        ])->assertCreated();
    }

    public function test_branch_must_belong_to_target_company(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');
        // Branch belongs to C1, but the grant targets C2.
        $branch = Branch::withoutGlobalScope(CompanyScope::class)
            ->create(['company_id' => $c1->id, 'name' => 'HQ', 'code' => 'HQ']);

        $actor = $this->actor($c1, 'super-admin');
        $grantee = User::factory()->create(['company_id' => $c1->id, 'is_active' => true]);

        Sanctum::actingAs($actor);

        $this->postJson('/api/v1/cross-tenant-grants', [
            'grantee_type' => 'user',
            'grantee_id' => $grantee->id,
            'target_company_id' => $c2->id,
            'target_branch_id' => $branch->id,
        ])->assertStatus(422);

        $this->assertDatabaseEmpty('cross_tenant_grants');
    }

    public function test_super_admin_can_revoke_grant(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');
        $actor = $this->actor($c1, 'super-admin');
        $grantee = User::factory()->create(['company_id' => $c1->id, 'is_active' => true]);

        $grant = CrossTenantGrant::create([
            'grantee_type' => 'user',
            'grantee_id' => $grantee->id,
            'target_company_id' => $c2->id,
            'granted_by' => $actor->id,
            'is_active' => true,
        ]);

        Sanctum::actingAs($actor);

        $this->deleteJson("/api/v1/cross-tenant-grants/{$grant->id}")->assertNoContent();

        $this->assertDatabaseHas('cross_tenant_grants', ['id' => $grant->id, 'is_active' => false]);
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $actor->id,
            'action' => AuditLog::ACTION_CROSS_GRANT_REVOKED,
        ]);
    }

    public function test_invalid_grantee_type_is_rejected(): void
    {
        $c1 = $this->company('C1');
        $actor = $this->actor($c1, 'super-admin');

        Sanctum::actingAs($actor);

        $this->postJson('/api/v1/cross-tenant-grants', [
            'grantee_type' => 'department',
            'grantee_id' => 1,
            'target_company_id' => $c1->id,
        ])->assertStatus(422);
    }
}
