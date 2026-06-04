<?php

namespace Tests\Feature;

use App\Core\Tenancy\ConfigResolver;
use App\Models\Company;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\Fixtures\ConfigFixture;
use Tests\TestCase;

/**
 * The Phase-0 config-tenancy seam: global-default + per-company-override.
 * Proves the three invariants the architecture plan calls for:
 *   (1) a tenant browses global defaults + their own overrides, never another company's;
 *   (2) super-admin/developer see everything;
 *   (3) the ConfigResolver applies config by the RECORD's company (scope-off), not the
 *       acting user's visibility — and SharedConfig never auto-stamps company_id.
 */
class ConfigVisibilityScopeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);

        Schema::create('config_fixtures', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id')->nullable();
            $table->unsignedBigInteger('derived_from_id')->nullable();
            $table->string('key');
            $table->string('label')->nullable();
            $table->boolean('is_active')->default(true);
        });
    }

    private function company(string $code): Company
    {
        return Company::create(['name' => "Company $code", 'code' => $code, 'is_active' => true]);
    }

    public function test_tenant_sees_global_defaults_and_own_overrides_only(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');

        ConfigFixture::create(['company_id' => null, 'key' => 'wf', 'label' => 'global']);
        ConfigFixture::create(['company_id' => $c1->id, 'key' => 'wf', 'label' => 'c1 override']);
        ConfigFixture::create(['company_id' => $c2->id, 'key' => 'wf', 'label' => 'c2 override']);

        $actor = User::factory()->create(['company_id' => $c1->id, 'is_active' => true]);
        $this->actingAs($actor);

        $visible = ConfigFixture::all();
        $companyIds = $visible->pluck('company_id')->toArray();

        $this->assertContains(null, $companyIds, 'global default must be visible');
        $this->assertContains($c1->id, $companyIds, 'own override must be visible');
        $this->assertNotContains($c2->id, $companyIds, 'another company override must be hidden');
        $this->assertCount(2, $visible);
    }

    public function test_super_admin_sees_all_config(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');

        ConfigFixture::create(['company_id' => null, 'key' => 'wf']);
        ConfigFixture::create(['company_id' => $c1->id, 'key' => 'wf']);
        ConfigFixture::create(['company_id' => $c2->id, 'key' => 'wf']);

        $admin = User::factory()->create(['company_id' => $c1->id, 'is_active' => true]);
        $this->assignRole($admin, 'super-admin');
        $this->actingAs($admin);

        $this->assertCount(3, ConfigFixture::all());
    }

    public function test_resolver_prefers_company_override_then_falls_back_to_global(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');

        $global = ConfigFixture::create(['company_id' => null, 'key' => 'wf', 'label' => 'global']);
        $c1Row = ConfigFixture::create(['company_id' => $c1->id, 'key' => 'wf', 'label' => 'c1 override']);

        $resolver = new ConfigResolver;

        // c1 has an override → resolve to it; c2 has none → fall back to global; null → global.
        $this->assertSame($c1Row->id, $resolver->resolve(ConfigFixture::class, ['key' => 'wf'], $c1->id)?->id);
        $this->assertSame($global->id, $resolver->resolve(ConfigFixture::class, ['key' => 'wf'], $c2->id)?->id);
        $this->assertSame($global->id, $resolver->resolve(ConfigFixture::class, ['key' => 'wf'], null)?->id);
    }

    public function test_resolver_keys_off_records_company_not_actor_visibility(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');

        ConfigFixture::create(['company_id' => null, 'key' => 'wf']);
        $c1Row = ConfigFixture::create(['company_id' => $c1->id, 'key' => 'wf']);

        // Act as a C2 user who, via the visibility scope, can NOT browse C1's override...
        $actor = User::factory()->create(['company_id' => $c2->id, 'is_active' => true]);
        $this->actingAs($actor);
        $this->assertNotContains($c1->id, ConfigFixture::all()->pluck('company_id')->toArray());

        // ...yet resolving config for a C1 record must still return C1's override.
        $resolved = (new ConfigResolver)->resolve(ConfigFixture::class, ['key' => 'wf'], $c1->id);
        $this->assertSame($c1Row->id, $resolved?->id);
    }

    public function test_shared_config_does_not_autostamp_company_id(): void
    {
        $c1 = $this->company('C1');
        $actor = User::factory()->create(['company_id' => $c1->id, 'is_active' => true]);
        $this->actingAs($actor);

        // Unlike BelongsToCompany, creating without an explicit company_id authors a
        // GLOBAL default (NULL), not a row stamped with the actor's company.
        $row = ConfigFixture::create(['key' => 'wf']);

        $this->assertNull($row->fresh()->company_id);
        $this->assertTrue($row->isGlobalDefault());
    }

    public function test_helpers_scope_to_globals_or_a_single_company(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');

        ConfigFixture::create(['company_id' => null, 'key' => 'wf']);
        ConfigFixture::create(['company_id' => $c1->id, 'key' => 'wf']);
        ConfigFixture::create(['company_id' => $c2->id, 'key' => 'wf']);

        $this->assertCount(1, ConfigFixture::globalDefaults()->get());
        $this->assertCount(1, ConfigFixture::forCompanyConfig($c1->id)->get());
    }
}
