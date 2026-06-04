<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use App\Models\UserRoleAssignment;
use App\Policies\BasePolicy;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class BasePolicyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    /** Returns a concrete subclass that exposes the protected method for testing. */
    private function policy(): object
    {
        return new class extends BasePolicy {
            public function check(User $user, ?int $companyId): bool
            {
                return $this->inAllowedCompany($user, $companyId);
            }
        };
    }

    private function company(string $code = 'CO'): Company
    {
        return Company::create(['name' => "Company $code", 'code' => $code, 'is_active' => true, 'enforce_branch_isolation' => false]);
    }

    // ── Own company ───────────────────────────────────────────────────────────

    public function test_own_company_is_allowed(): void
    {
        $c    = $this->company();
        $user = User::factory()->create(['company_id' => $c->id]);

        $this->assertTrue($this->policy()->check($user, $c->id));
    }

    public function test_unrelated_company_is_denied(): void
    {
        $c1   = $this->company('C1');
        $c2   = $this->company('C2');
        $user = User::factory()->create(['company_id' => $c1->id]);

        $this->assertFalse($this->policy()->check($user, $c2->id));
    }

    public function test_null_company_id_is_denied(): void
    {
        $c    = $this->company();
        $user = User::factory()->create(['company_id' => $c->id]);

        $this->assertFalse($this->policy()->check($user, null));
    }

    // ── Company-scoped assignment grants access (Gap 10) ─────────────────────

    public function test_company_scoped_assignment_grants_access_to_that_company(): void
    {
        $c1   = $this->company('C1');
        $c2   = $this->company('C2');
        $user = User::factory()->create(['company_id' => $c1->id]);
        $role = Role::findByName('viewer', 'web');

        UserRoleAssignment::create([
            'user_id' => $user->id, 'role_id' => $role->id,
            'scope_type' => 'company', 'scope_id' => $c2->id,
        ]);

        $this->assertTrue($this->policy()->check($user, $c2->id));
    }

    public function test_assignment_to_company_a_does_not_grant_access_to_company_b(): void
    {
        $c1   = $this->company('C1');
        $c2   = $this->company('C2');
        $c3   = $this->company('C3');
        $user = User::factory()->create(['company_id' => $c1->id]);
        $role = Role::findByName('viewer', 'web');

        UserRoleAssignment::create([
            'user_id' => $user->id, 'role_id' => $role->id,
            'scope_type' => 'company', 'scope_id' => $c2->id,
        ]);

        $this->assertFalse($this->policy()->check($user, $c3->id));
    }

    // ── No recursion — uses DB::table not $user->teams() ─────────────────────

    public function test_inAllowedCompany_does_not_recurse_when_user_is_in_teams(): void
    {
        $c    = $this->company();
        $user = User::factory()->create(['company_id' => $c->id]);

        // Add the user to a team via the pivot — if $user->teams() were used inside
        // inAllowedCompany() it would trigger CompanyScope on Team → potential recursion.
        \DB::table('teams')->insert(['company_id' => $c->id, 'name' => 'TestTeam', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
        $teamId = \DB::table('teams')->where('name', 'TestTeam')->value('id');
        // team_members only has created_at, no updated_at
        \DB::table('team_members')->insert(['team_id' => $teamId, 'user_id' => $user->id, 'created_at' => now()]);

        // Should not throw; if it recursed it would hit PHP's stack limit
        $result = $this->policy()->check($user, $c->id);
        $this->assertTrue($result);
    }

    // ── Super-admin via before() ──────────────────────────────────────────────

    public function test_before_hook_grants_super_admin_full_access(): void
    {
        $c        = $this->company();
        $otherC   = $this->company('OTH');
        $superAdmin = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);
        $this->assignRole($superAdmin, 'super-admin');

        $policy = new class extends BasePolicy {
            public function testBefore(User $user): ?bool
            {
                return $this->before($user);
            }
        };

        $this->assertTrue($policy->testBefore($superAdmin));
    }

    public function test_before_hook_returns_false_for_inactive_user(): void
    {
        $c    = $this->company();
        $user = User::factory()->create(['company_id' => $c->id, 'is_active' => false]);
        $this->assignRole($user, 'super-admin');

        $policy = new class extends BasePolicy {
            public function testBefore(User $user): ?bool
            {
                return $this->before($user);
            }
        };

        $this->assertFalse($policy->testBefore($user));
    }

    public function test_before_hook_returns_null_for_regular_user(): void
    {
        $c    = $this->company();
        $user = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);

        $policy = new class extends BasePolicy {
            public function testBefore(User $user): ?bool
            {
                return $this->before($user);
            }
        };

        $this->assertNull($policy->testBefore($user));
    }
}
