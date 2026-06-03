<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use App\Models\UserRoleAssignment;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\SubmissionFormSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Phase 3 runtime API: the HTTP surface that lets a user file a request, see it, and act on
 * it through the workflow engine — the connective tissue that makes the form engine usable
 * over the wire. These routes are end-user (not admin-only).
 */
class SubmissionApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        $this->seed(SubmissionFormSeeder::class);
    }

    private function company(string $code): Company
    {
        return Company::create(['name' => "Company $code", 'code' => $code, 'is_active' => true]);
    }

    private function requester(Company $c): User
    {
        return User::factory()->create(['company_id' => $c->id, 'is_active' => true]);
    }

    private function approver(Company $c): User
    {
        $user = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);
        UserRoleAssignment::create([
            'user_id' => $user->id,
            'role_id' => Role::findByName('company-admin', 'web')->id,
            'scope_type' => 'company', 'scope_id' => $c->id,
        ]);
        $this->assignRole($user, 'company-admin');

        return $user;
    }

    private function leaveData(): array
    {
        return ['leave_type' => 'annual', 'start_date' => '2026-07-01', 'end_date' => '2026-07-03', 'days' => 3, 'reason' => 'Trip'];
    }

    private function fileLeave(User $requester): int
    {
        return $this->postJson('/api/v1/submissions', ['form_key' => 'leave', 'data' => $this->leaveData()])
            ->json('data.id');
    }

    // ── Forms catalog ───────────────────────────────────────────────────────────

    public function test_forms_index_lists_available_request_types(): void
    {
        Sanctum::actingAs($this->requester($this->company('C1')));

        $keys = collect($this->getJson('/api/v1/forms')->assertOk()->json('data'))->pluck('key')->all();
        $this->assertEqualsCanonicalizing(['leave', 'attendance-correction'], $keys);
    }

    public function test_form_show_returns_schema(): void
    {
        Sanctum::actingAs($this->requester($this->company('C1')));

        $this->getJson('/api/v1/forms/leave')->assertOk()
            ->assertJsonPath('data.workflow_key', 'leave')
            ->assertJsonPath('data.field_schema.0.key', 'leave_type');

        $this->getJson('/api/v1/forms/nope')->assertNotFound();
    }

    // ── Create ────────────────────────────────────────────────────────────────────

    public function test_file_a_request_starts_the_workflow(): void
    {
        Sanctum::actingAs($this->requester($this->company('C1')));

        $this->postJson('/api/v1/submissions', ['form_key' => 'leave', 'data' => $this->leaveData()])
            ->assertCreated()
            ->assertJsonPath('data.number', 'LEAVE-0001')
            ->assertJsonPath('data.state', 'awaiting_approval')
            ->assertJsonPath('data.state_category', 'in_progress');
    }

    public function test_invalid_payload_returns_422(): void
    {
        Sanctum::actingAs($this->requester($this->company('C1')));

        $this->postJson('/api/v1/submissions', ['form_key' => 'leave', 'data' => ['leave_type' => 'bogus', 'days' => 999]])
            ->assertStatus(422);
    }

    public function test_unauthenticated_is_rejected(): void
    {
        $this->getJson('/api/v1/submissions')->assertUnauthorized();
        $this->postJson('/api/v1/submissions', [])->assertUnauthorized();
    }

    // ── Listing ─────────────────────────────────────────────────────────────────

    public function test_mine_lists_only_my_submissions(): void
    {
        $c = $this->company('C1');
        $me = $this->requester($c);
        $other = $this->requester($c);

        Sanctum::actingAs($other);
        $this->fileLeave($other);

        Sanctum::actingAs($me);
        $mineId = $this->fileLeave($me);

        $ids = collect($this->getJson('/api/v1/submissions?scope=mine')->assertOk()->json('data'))->pluck('id')->all();
        $this->assertSame([$mineId], $ids);
    }

    public function test_inbox_requires_approver(): void
    {
        $c = $this->company('C1');
        $requester = $this->requester($c);

        Sanctum::actingAs($requester);
        $this->getJson('/api/v1/submissions?scope=inbox')->assertForbidden();

        Sanctum::actingAs($this->approver($c));
        $this->getJson('/api/v1/submissions?scope=inbox')->assertOk();
    }

    public function test_inbox_shows_pending_submissions_to_approver(): void
    {
        $c = $this->company('C1');
        $requester = $this->requester($c);
        Sanctum::actingAs($requester);
        $id = $this->fileLeave($requester);

        Sanctum::actingAs($this->approver($c));
        $ids = collect($this->getJson('/api/v1/submissions?scope=inbox')->assertOk()->json('data'))->pluck('id')->all();
        $this->assertContains($id, $ids);
    }

    // ── View authorisation ────────────────────────────────────────────────────────

    public function test_another_user_cannot_view_my_submission(): void
    {
        $c = $this->company('C1');
        $me = $this->requester($c);
        Sanctum::actingAs($me);
        $id = $this->fileLeave($me);

        // A different non-approver user in the same company.
        Sanctum::actingAs($this->requester($c));
        $this->getJson("/api/v1/submissions/{$id}")->assertForbidden();
    }

    public function test_cross_company_submission_is_not_found(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');
        $me = $this->requester($c1);
        Sanctum::actingAs($me);
        $id = $this->fileLeave($me);

        // CompanyScope hides it from a C2 user → 404 at route-model binding.
        Sanctum::actingAs($this->requester($c2));
        $this->getJson("/api/v1/submissions/{$id}")->assertNotFound();
    }

    // ── Acting through the engine ───────────────────────────────────────────────────

    public function test_show_exposes_timeline_and_transitions(): void
    {
        $c = $this->company('C1');
        $requester = $this->requester($c);
        Sanctum::actingAs($requester);
        $id = $this->fileLeave($requester);

        // Requester sees the started timeline but has no actions (cannot approve).
        $body = $this->getJson("/api/v1/submissions/{$id}")->assertOk()->json('data');
        $this->assertNotEmpty($body['timeline']);
        $this->assertSame([], $body['available_transitions']);
    }

    public function test_approver_can_approve_via_the_api(): void
    {
        $c = $this->company('C1');
        $requester = $this->requester($c);
        Sanctum::actingAs($requester);
        $id = $this->fileLeave($requester);

        $approver = $this->approver($c);
        Sanctum::actingAs($approver);

        $slugs = collect($this->getJson("/api/v1/submissions/{$id}/transitions")->assertOk()->json('data'))->pluck('slug')->all();
        $this->assertEqualsCanonicalizing(['approve', 'reject'], $slugs);

        $this->postJson("/api/v1/submissions/{$id}/transitions/approve")
            ->assertOk()
            ->assertJsonPath('data.state', 'approved')
            ->assertJsonPath('data.state_category', 'resolved');
    }

    public function test_requester_cannot_approve_own_via_api(): void
    {
        $c = $this->company('C1');
        // Requester also holds the approver role; prevent_self must still block.
        $requester = $this->approver($c);
        Sanctum::actingAs($requester);
        $id = $this->fileLeave($requester);

        $this->postJson("/api/v1/submissions/{$id}/transitions/approve")->assertForbidden();
    }
}
