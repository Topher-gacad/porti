<?php

namespace Tests\Feature;

use App\Core\Tenancy\ConfigVisibilityScope;
use App\Models\AuditLog;
use App\Models\Company;
use App\Models\PortalApp;
use App\Models\User;
use Database\Seeders\AppSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Phase 1: the apps catalog + launcher, exercising the Phase-0 config-tenancy kernel on
 * a real config table. A launcher RESOLVES the effective tile for the user's company
 * (override-else-global); it never browses another company's overrides.
 */
class AppLauncherTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    private function company(string $code): Company
    {
        return Company::create(['name' => "Company $code", 'code' => $code, 'is_active' => true]);
    }

    /** Author a tile scope-off so a NULL company_id stays a global default. */
    private function tile(array $attrs): PortalApp
    {
        return PortalApp::withoutGlobalScope(ConfigVisibilityScope::class)->create(array_merge([
            'kind' => PortalApp::KIND_EXTERNAL_SSO,
            'name' => 'Tile',
            'url' => 'https://example.com',
            'is_active' => true,
        ], $attrs));
    }

    public function test_user_sees_global_tiles(): void
    {
        $c = $this->company('C1');
        $this->tile(['company_id' => null, 'key' => 'erpnext', 'name' => 'ERPNext', 'sort_order' => 10]);
        $this->tile(['company_id' => null, 'key' => 'nextcloud', 'name' => 'Nextcloud', 'sort_order' => 20]);

        $user = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);
        Sanctum::actingAs($user);

        $res = $this->getJson('/api/v1/apps')->assertOk();
        $keys = collect($res->json('data'))->pluck('key')->all();

        $this->assertEqualsCanonicalizing(['erpnext', 'nextcloud'], $keys);
        // The raw URL is never exposed by the list — launching must flow through the broker.
        $this->assertArrayNotHasKey('url', $res->json('data.0'));
    }

    public function test_company_override_wins_over_global_for_same_key(): void
    {
        $c = $this->company('C1');
        $this->tile(['company_id' => null, 'key' => 'erpnext', 'name' => 'ERPNext Global']);
        $override = $this->tile(['company_id' => $c->id, 'key' => 'erpnext', 'name' => 'ERPNext (C1)']);

        $user = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);
        Sanctum::actingAs($user);

        $data = $this->getJson('/api/v1/apps')->assertOk()->json('data');

        $this->assertCount(1, $data, 'override collapses with its global into one tile');
        $this->assertSame($override->id, $data[0]['id']);
        $this->assertFalse($data[0]['is_global']);
    }

    public function test_user_never_sees_another_companys_override(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');
        $this->tile(['company_id' => null, 'key' => 'erpnext', 'name' => 'Global']);
        $this->tile(['company_id' => $c2->id, 'key' => 'erpnext', 'name' => 'C2 only']);

        $user = User::factory()->create(['company_id' => $c1->id, 'is_active' => true]);
        Sanctum::actingAs($user);

        $data = $this->getJson('/api/v1/apps')->assertOk()->json('data');

        $this->assertCount(1, $data);
        $this->assertSame('Global', $data[0]['name']);
        $this->assertTrue($data[0]['is_global']);
    }

    public function test_inactive_tiles_are_hidden(): void
    {
        $c = $this->company('C1');
        $this->tile(['company_id' => null, 'key' => 'erpnext', 'is_active' => true]);
        $this->tile(['company_id' => null, 'key' => 'nextcloud', 'is_active' => false]);

        $user = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);
        Sanctum::actingAs($user);

        $keys = collect($this->getJson('/api/v1/apps')->assertOk()->json('data'))->pluck('key')->all();
        $this->assertSame(['erpnext'], $keys);
    }

    public function test_launch_returns_resolved_url_and_audits(): void
    {
        $c = $this->company('C1');
        $this->tile(['company_id' => null, 'key' => 'erpnext', 'url' => 'https://global.example.com']);
        $this->tile(['company_id' => $c->id, 'key' => 'erpnext', 'url' => 'https://c1.example.com']);

        $user = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/launch/erpnext')
            ->assertOk()
            ->assertJson(['url' => 'https://c1.example.com']);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $user->id,
            'action' => AuditLog::ACTION_APP_LAUNCHED,
        ]);
    }

    public function test_launch_falls_back_to_global_when_no_override(): void
    {
        $c = $this->company('C1');
        $this->tile(['company_id' => null, 'key' => 'erpnext', 'url' => 'https://global.example.com']);

        $user = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/launch/erpnext')
            ->assertOk()
            ->assertJson(['url' => 'https://global.example.com']);
    }

    public function test_launch_unknown_key_is_not_found(): void
    {
        $c = $this->company('C1');
        $user = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/launch/does-not-exist')->assertNotFound();
    }

    public function test_apps_endpoint_requires_authentication(): void
    {
        $this->getJson('/api/v1/apps')->assertUnauthorized();
    }

    public function test_seeder_creates_global_sso_tiles(): void
    {
        $this->seed(AppSeeder::class);

        $globals = PortalApp::withoutGlobalScope(ConfigVisibilityScope::class)
            ->whereNull('company_id')
            ->pluck('key')
            ->all();

        $this->assertContains('erpnext', $globals);
        $this->assertContains('nextcloud', $globals);
    }
}
