<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Company;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Phase 1: JIT SSO provisioning — the three paths and the one company-resolution rule
 * (architecture §8). Existing sync behaviour (token, super-admin bootstrap) lives in
 * PortalConfigTest; this file covers company resolution, invite linking, and conflicts.
 */
class SsoProvisioningTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        config(['portal.sync_secret' => 'secret-123']);
    }

    private function sync(array $payload)
    {
        return $this->withHeader('X-Service-Token', 'secret-123')
            ->postJson('/api/v1/auth/sync', $payload);
    }

    private function company(string $code, bool $active = true): Company
    {
        return Company::create(['name' => "Company $code", 'code' => $code, 'is_active' => $active]);
    }

    private function basePayload(array $overrides = []): array
    {
        return array_merge([
            'authentik_uid' => 'uid-1',
            'email' => 'new@example.com',
            'name' => 'New User',
            'username' => 'newuser',
        ], $overrides);
    }

    public function test_company_code_resolves_company_for_new_user(): void
    {
        $c = $this->company('ACME');

        $this->sync($this->basePayload(['company_code' => 'ACME']))->assertOk();

        $this->assertSame($c->id, User::where('email', 'new@example.com')->first()->company_id);
    }

    public function test_group_naming_a_company_code_resolves_company(): void
    {
        $c = $this->company('BETA');

        $this->sync($this->basePayload(['groups' => ['some-group', 'BETA']]))->assertOk();

        $this->assertSame($c->id, User::where('email', 'new@example.com')->first()->company_id);
    }

    public function test_unmatched_attributes_land_user_in_unassigned_queue(): void
    {
        $this->company('ACME');

        $this->sync($this->basePayload(['company_code' => 'NOPE', 'groups' => ['nada']]))->assertOk();

        $user = User::where('email', 'new@example.com')->first();
        $this->assertNull($user->company_id);
        $this->assertDatabaseHas('audit_logs', [
            'action' => AuditLog::ACTION_USER_UNASSIGNED,
            'target_id' => $user->id,
        ]);
    }

    public function test_inactive_company_code_does_not_resolve(): void
    {
        $this->company('OLD', active: false);

        $this->sync($this->basePayload(['company_code' => 'OLD']))->assertOk();

        $this->assertNull(User::where('email', 'new@example.com')->first()->company_id);
    }

    public function test_pending_invite_is_linked_and_keeps_its_company(): void
    {
        $invited = $this->company('INV');
        $other = $this->company('OTHER');

        // Admin pre-provisioned this user with a company but no SSO identity yet.
        $pending = User::factory()->create([
            'email' => 'invitee@example.com',
            'authentik_uid' => null,
            'company_id' => $invited->id,
            'is_active' => true,
        ]);

        // The SSO payload even carries a *different* company_code — the invite wins.
        $this->sync($this->basePayload([
            'authentik_uid' => 'uid-invitee',
            'email' => 'invitee@example.com',
            'company_code' => 'OTHER',
        ]))->assertOk();

        $pending->refresh();
        $this->assertSame('uid-invitee', $pending->authentik_uid);
        $this->assertSame($invited->id, $pending->company_id);
        $this->assertNotSame($other->id, $pending->company_id);
        $this->assertDatabaseHas('audit_logs', [
            'action' => AuditLog::ACTION_USER_LINKED_SSO,
            'target_id' => $pending->id,
        ]);
    }

    public function test_email_bound_to_a_different_identity_is_rejected(): void
    {
        $c = $this->company('ACME');
        User::factory()->create([
            'email' => 'taken@example.com',
            'authentik_uid' => 'uid-original',
            'company_id' => $c->id,
            'is_active' => true,
        ]);

        $this->sync($this->basePayload([
            'authentik_uid' => 'uid-intruder',
            'email' => 'taken@example.com',
        ]))->assertStatus(409);

        $this->assertDatabaseHas('audit_logs', ['action' => AuditLog::ACTION_AUTH_SSO_FAILED]);
    }

    public function test_returning_user_company_is_not_overridden(): void
    {
        $home = $this->company('HOME');
        $this->company('ELSEWHERE');

        $returning = User::factory()->create([
            'email' => 'back@example.com',
            'authentik_uid' => 'uid-back',
            'company_id' => $home->id,
            'is_active' => true,
        ]);

        $this->sync($this->basePayload([
            'authentik_uid' => 'uid-back',
            'email' => 'back@example.com',
            'company_code' => 'ELSEWHERE',
        ]))->assertOk();

        $this->assertSame($home->id, $returning->fresh()->company_id);
    }

    public function test_local_only_account_can_be_linked_to_sso(): void
    {
        $c = $this->company('ACME');
        $local = User::factory()->create([
            'email' => 'local@example.com',
            'authentik_uid' => null,
            'company_id' => $c->id,
            'is_active' => true,
            'password' => Hash::make('break-glass-pass'),
        ]);

        $this->sync($this->basePayload([
            'authentik_uid' => 'uid-local',
            'email' => 'local@example.com',
        ]))->assertOk();

        $this->assertSame('uid-local', $local->fresh()->authentik_uid);
    }
}
