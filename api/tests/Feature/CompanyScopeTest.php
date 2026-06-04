<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Company;
use App\Models\User;
use App\Models\UserRoleAssignment;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CompanyScopeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    private function company(string $code, bool $isolation = false): Company
    {
        return Company::create([
            'name'                    => "Company $code",
            'code'                    => $code,
            'is_active'               => true,
            'enforce_branch_isolation' => $isolation,
        ]);
    }

    private function branch(Company $c, string $code): Branch
    {
        return Branch::create(['company_id' => $c->id, 'name' => "Branch $code", 'code' => $code, 'is_active' => true]);
    }

    // ── Tenant isolation ──────────────────────────────────────────────────────

    public function test_user_only_sees_own_companys_users(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');

        $actor = User::factory()->create(['company_id' => $c1->id, 'is_active' => true]);
        User::factory()->create(['company_id' => $c1->id]); // visible
        User::factory()->create(['company_id' => $c2->id]); // hidden

        $this->actingAs($actor);

        $visibleCompanyIds = User::all()->pluck('company_id')->unique()->filter()->toArray();
        $this->assertEqualsCanonicalizing([$c1->id], $visibleCompanyIds);
    }

    public function test_super_admin_sees_all_companies(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');

        $admin = User::factory()->create(['company_id' => $c1->id, 'is_active' => true]);
        $this->assignRole($admin, 'super-admin');

        User::factory()->create(['company_id' => $c1->id]);
        User::factory()->create(['company_id' => $c2->id]);

        $this->actingAs($admin);

        $companyIds = User::all()->pluck('company_id')->filter()->unique()->sort()->values()->toArray();
        $this->assertContains($c1->id, $companyIds);
        $this->assertContains($c2->id, $companyIds);
    }

    public function test_company_scoped_assignment_grants_visibility_to_that_company(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');

        $actor = User::factory()->create(['company_id' => $c1->id, 'is_active' => true]);
        $role  = Role::findByName('viewer', 'web');
        UserRoleAssignment::create([
            'user_id' => $actor->id, 'role_id' => $role->id,
            'scope_type' => 'company', 'scope_id' => $c2->id,
        ]);

        User::factory()->create(['company_id' => $c2->id]);

        $this->actingAs($actor);

        $companyIds = User::all()->pluck('company_id')->filter()->unique()->toArray();
        $this->assertContains($c1->id, $companyIds);
        $this->assertContains($c2->id, $companyIds);
    }

    public function test_unauthenticated_query_is_not_filtered_by_scope(): void
    {
        $c1 = $this->company('C1');
        User::factory()->create(['company_id' => $c1->id]);

        // CompanyScope early-returns when there is no authenticated user, so all
        // rows are visible. Unauthenticated access is blocked by the auth middleware
        // in production; the scope is not the auth gate.
        $count = User::count();
        $this->assertGreaterThan(0, $count);
    }

    // ── Branch isolation ──────────────────────────────────────────────────────

    public function test_branch_isolation_restricts_user_to_own_branch(): void
    {
        $c1 = $this->company('C1', isolation: true);
        $b1 = $this->branch($c1, 'B1');
        $b2 = $this->branch($c1, 'B2');

        $actor = User::factory()->create(['company_id' => $c1->id, 'branch_id' => $b1->id, 'is_active' => true]);
        User::factory()->create(['company_id' => $c1->id, 'branch_id' => $b1->id]); // visible
        User::factory()->create(['company_id' => $c1->id, 'branch_id' => $b2->id]); // hidden

        $this->actingAs($actor);

        $branchIds = User::all()->pluck('branch_id')->filter()->unique()->toArray();
        $this->assertContains($b1->id, $branchIds);
        $this->assertNotContains($b2->id, $branchIds);
    }

    public function test_branch_isolation_is_skipped_when_disabled_on_company(): void
    {
        $c1 = $this->company('C1', isolation: false); // isolation OFF
        $b1 = $this->branch($c1, 'B1');
        $b2 = $this->branch($c1, 'B2');

        $actor = User::factory()->create(['company_id' => $c1->id, 'branch_id' => $b1->id, 'is_active' => true]);
        User::factory()->create(['company_id' => $c1->id, 'branch_id' => $b2->id]);

        $this->actingAs($actor);

        $branchIds = User::all()->pluck('branch_id')->filter()->unique()->toArray();
        $this->assertContains($b1->id, $branchIds);
        $this->assertContains($b2->id, $branchIds);
    }

    public function test_company_level_user_sees_all_branches_even_when_isolation_on(): void
    {
        $c1 = $this->company('C1', isolation: true);
        $b1 = $this->branch($c1, 'B1');
        $b2 = $this->branch($c1, 'B2');

        // Actor has no branch_id — they are a company-level user
        $actor = User::factory()->create(['company_id' => $c1->id, 'branch_id' => null, 'is_active' => true]);
        User::factory()->create(['company_id' => $c1->id, 'branch_id' => $b1->id]);
        User::factory()->create(['company_id' => $c1->id, 'branch_id' => $b2->id]);

        $this->actingAs($actor);

        $branchIds = User::all()->pluck('branch_id')->filter()->unique()->toArray();
        $this->assertContains($b1->id, $branchIds);
        $this->assertContains($b2->id, $branchIds);
    }

    public function test_branch_scoped_assignment_grants_visibility_to_additional_branch(): void
    {
        $c1 = $this->company('C1', isolation: true);
        $b1 = $this->branch($c1, 'B1');
        $b2 = $this->branch($c1, 'B2');

        $actor = User::factory()->create(['company_id' => $c1->id, 'branch_id' => $b1->id, 'is_active' => true]);
        $role  = Role::findByName('viewer', 'web');
        UserRoleAssignment::create([
            'user_id' => $actor->id, 'role_id' => $role->id,
            'scope_type' => 'branch', 'scope_id' => $b2->id,
        ]);

        User::factory()->create(['company_id' => $c1->id, 'branch_id' => $b2->id]);

        $this->actingAs($actor);

        $branchIds = User::all()->pluck('branch_id')->filter()->unique()->toArray();
        $this->assertContains($b1->id, $branchIds);
        $this->assertContains($b2->id, $branchIds);
    }

    public function test_company_level_user_is_visible_to_all_branches_in_isolated_company(): void
    {
        $c1 = $this->company('C1', isolation: true);
        $b1 = $this->branch($c1, 'B1');

        $actor = User::factory()->create(['company_id' => $c1->id, 'branch_id' => $b1->id, 'is_active' => true]);
        // This user has no branch — company-level; should be visible to branch users via whereNull(branch_id)
        $companyLevelUser = User::factory()->create(['company_id' => $c1->id, 'branch_id' => null]);

        $this->actingAs($actor);

        $ids = User::all()->pluck('id')->toArray();
        $this->assertContains($companyLevelUser->id, $ids);
    }
}
