<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * These behaviours were previously driven by env() read at request time, which
 * returns null under `php artisan config:cache` (production / Octane). They now
 * read config('portal.*'). Setting config() at runtime here proves the code path
 * honours config — and would fail if anyone reverts a caller back to env().
 */
class PortalConfigTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    private function company(): Company
    {
        return Company::create([
            'name' => 'Acme', 'code' => 'ACM', 'is_active' => true, 'enforce_branch_isolation' => false,
        ]);
    }

    private function syncHeaders(): array
    {
        config(['portal.sync_secret' => 'secret-123']);

        return ['X-Service-Token' => 'secret-123'];
    }

    // ── AdminOnly gate (config: portal.admin_only) ─────────────────────────────

    public function test_admin_only_gate_blocks_ordinary_roles_when_enabled(): void
    {
        config(['portal.admin_only' => true]);
        $user = User::factory()->create(['company_id' => $this->company()->id, 'is_active' => true]);
        $this->assignRole($user, 'company-admin');

        Sanctum::actingAs($user);
        $this->getJson('/api/v1/users')->assertForbidden();
    }

    public function test_admin_only_gate_allows_ordinary_roles_when_disabled(): void
    {
        config(['portal.admin_only' => false]);
        $user = User::factory()->create(['company_id' => $this->company()->id, 'is_active' => true]);
        $this->assignRole($user, 'company-admin');

        Sanctum::actingAs($user);
        $this->getJson('/api/v1/users')->assertOk();
    }

    public function test_admin_only_gate_always_allows_super_admin(): void
    {
        config(['portal.admin_only' => true]);
        $user = User::factory()->create(['company_id' => $this->company()->id, 'is_active' => true]);
        $this->assignRole($user, 'super-admin');

        Sanctum::actingAs($user);
        $this->getJson('/api/v1/users')->assertOk();
    }

    // ── Service token (config: portal.sync_secret) ─────────────────────────────

    public function test_sync_rejects_missing_or_wrong_service_token(): void
    {
        config(['portal.sync_secret' => 'secret-123']);
        $payload = ['authentik_uid' => 'uid-1', 'email' => 'a@example.com', 'name' => 'A', 'username' => 'a'];

        $this->postJson('/api/v1/auth/sync', $payload)->assertUnauthorized();
        $this->withHeader('X-Service-Token', 'wrong')
            ->postJson('/api/v1/auth/sync', $payload)->assertUnauthorized();
    }

    public function test_sync_succeeds_with_valid_service_token(): void
    {
        $this->withHeaders($this->syncHeaders())
            ->postJson('/api/v1/auth/sync', [
                'authentik_uid' => 'uid-1', 'email' => 'a@example.com', 'name' => 'A', 'username' => 'a',
            ])
            ->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'email']]);
    }

    // ── SSO super-admin bootstrap (config: portal.super_admin.email) ───────────

    public function test_sync_grants_super_admin_to_bootstrap_email(): void
    {
        config(['portal.super_admin.email' => 'boss@example.com']);

        $this->withHeaders($this->syncHeaders())
            ->postJson('/api/v1/auth/sync', [
                'authentik_uid' => 'uid-boss', 'email' => 'boss@example.com', 'name' => 'Boss', 'username' => 'boss',
            ])
            ->assertOk();

        $user = User::where('email', 'boss@example.com')->first();
        $this->assertTrue($user->hasRole('super-admin'));
        $this->assertDatabaseHas('user_role_assignments', [
            'user_id' => $user->id, 'scope_type' => 'global',
        ]);
    }

    public function test_sync_does_not_grant_super_admin_to_other_emails(): void
    {
        config(['portal.super_admin.email' => 'boss@example.com']);

        $this->withHeaders($this->syncHeaders())
            ->postJson('/api/v1/auth/sync', [
                'authentik_uid' => 'uid-jane', 'email' => 'jane@example.com', 'name' => 'Jane', 'username' => 'jane',
            ])
            ->assertOk();

        $this->assertFalse(User::where('email', 'jane@example.com')->first()->hasRole('super-admin'));
    }

    // ── Login token expiry (config: portal.token_expiration_minutes) ───────────

    public function test_login_token_is_issued_with_an_expiry(): void
    {
        config(['portal.token_expiration_minutes' => 60]);

        $this->withHeaders($this->syncHeaders())
            ->postJson('/api/v1/auth/sync', [
                'authentik_uid' => 'uid-exp', 'email' => 'exp@example.com', 'name' => 'Exp', 'username' => 'exp',
            ])
            ->assertOk();

        $token = PersonalAccessToken::where('name', 'login')->latest('id')->first();
        $this->assertNotNull($token);
        $this->assertNotNull($token->expires_at);
    }

    public function test_token_expiry_can_be_disabled_with_zero(): void
    {
        config(['portal.token_expiration_minutes' => 0]);

        $this->withHeaders($this->syncHeaders())
            ->postJson('/api/v1/auth/sync', [
                'authentik_uid' => 'uid-noexp', 'email' => 'noexp@example.com', 'name' => 'NoExp', 'username' => 'noexp',
            ])
            ->assertOk();

        $token = PersonalAccessToken::where('name', 'login')->latest('id')->first();
        $this->assertNotNull($token);
        $this->assertNull($token->expires_at);
    }

    // ── Local break-glass auth (config: portal.allow_local_auth) ───────────────

    public function test_local_auth_is_forbidden_when_disabled(): void
    {
        config(['portal.allow_local_auth' => false]);

        $this->withHeaders($this->syncHeaders())
            ->postJson('/api/v1/auth/local', ['email' => 'x@example.com', 'password' => 'whatever'])
            ->assertForbidden();
    }

    public function test_local_auth_issues_token_when_enabled(): void
    {
        config(['portal.allow_local_auth' => true]);
        $user = User::factory()->create([
            'company_id' => $this->company()->id, 'is_active' => true,
            'password' => Hash::make('correct-horse-battery'),
        ]);

        $this->withHeaders($this->syncHeaders())
            ->postJson('/api/v1/auth/local', ['email' => $user->email, 'password' => 'correct-horse-battery'])
            ->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'email']]);
    }
}
