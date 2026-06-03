<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Team;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TeamControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_index_honours_per_page(): void
    {
        $company = Company::create([
            'name' => 'Acme', 'code' => 'ACM', 'is_active' => true, 'enforce_branch_isolation' => false,
        ]);
        $admin = User::factory()->create(['company_id' => $company->id, 'is_active' => true]);
        $this->assignRole($admin, 'super-admin');

        for ($i = 0; $i < 3; $i++) {
            Team::create(['company_id' => $company->id, 'name' => "Team {$i}", 'is_active' => true]);
        }

        Sanctum::actingAs($admin);

        // Previously hardcoded paginate(20); now respects the requested page size.
        $this->getJson('/api/v1/teams?per_page=2')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.per_page', 2)
            ->assertJsonPath('meta.total', 3);
    }
}
