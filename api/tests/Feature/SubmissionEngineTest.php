<?php

namespace Tests\Feature;

use App\Core\Shared\Sequence;
use App\Core\Workflow\WorkflowEngine;
use App\Models\Company;
use App\Models\User;
use App\Models\UserRoleAssignment;
use App\Modules\Submissions\Submission;
use App\Modules\Submissions\SubmissionService;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\SubmissionFormSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Tests\TestCase;

/**
 * Phase 3b: the form/submission engine end-to-end — a request type is pure config. Creating a
 * submission resolves the form, validates the payload, snapshots the version, numbers it via
 * an Octane-safe sequence, and starts the bound workflow; approval then closes it out.
 */
class SubmissionEngineTest extends TestCase
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

    private function service(): SubmissionService
    {
        return app(SubmissionService::class);
    }

    private function leaveData(): array
    {
        return [
            'leave_type' => 'annual', 'start_date' => '2026-07-01', 'end_date' => '2026-07-03',
            'days' => 3, 'reason' => 'Family trip',
        ];
    }

    // ── Sequence ──────────────────────────────────────────────────────────────────

    public function test_sequence_is_monotonic_per_key(): void
    {
        $seq = app(Sequence::class);
        $this->assertSame(1, $seq->next('a'));
        $this->assertSame(2, $seq->next('a'));
        $this->assertSame(1, $seq->next('b'));
    }

    // ── Create ──────────────────────────────────────────────────────────────────────

    public function test_create_leave_submission_runs_the_whole_flow(): void
    {
        $c = $this->company('C1');
        $requester = $this->requester($c);
        Sanctum::actingAs($requester);

        $submission = $this->service()->create('leave', $this->leaveData(), $requester);

        $this->assertSame('LEAVE-0001', $submission->number);
        $this->assertSame('awaiting_approval', $submission->workflow_state);
        $this->assertSame('in_progress', $submission->state_category);
        $this->assertNotNull($submission->workflow_version_id);
        $this->assertSame('annual', $submission->data['leave_type']);

        // The initial state is an approval gate → a pending approval was opened on start.
        $this->assertDatabaseHas('workflow_approvals', [
            'approvable_type' => 'submission', 'approvable_id' => $submission->id, 'status' => 'pending',
        ]);
        $this->assertDatabaseHas('activity_events', ['subject_type' => 'submission', 'verb' => 'workflow.started']);
    }

    public function test_invalid_payload_is_rejected(): void
    {
        $c = $this->company('C1');
        $requester = $this->requester($c);
        Sanctum::actingAs($requester);

        $this->expectException(ValidationException::class);
        // days exceeds max, leave_type out of options.
        $this->service()->create('leave', ['leave_type' => 'bogus', 'start_date' => '2026-07-01', 'end_date' => '2026-07-03', 'days' => 999, 'reason' => 'x'], $requester);
    }

    public function test_numbering_is_per_company_and_per_form(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');
        $r1 = $this->requester($c1);
        $r2 = $this->requester($c2);

        Sanctum::actingAs($r1);
        $this->assertSame('LEAVE-0001', $this->service()->create('leave', $this->leaveData(), $r1)->number);
        $this->assertSame('LEAVE-0002', $this->service()->create('leave', $this->leaveData(), $r1)->number);

        // Different company restarts the leave series.
        Sanctum::actingAs($r2);
        $this->assertSame('LEAVE-0001', $this->service()->create('leave', $this->leaveData(), $r2)->number);

        // Different form has its own series within the same company.
        Sanctum::actingAs($r1);
        $att = $this->service()->create('attendance-correction', ['work_date' => '2026-06-01', 'reason' => 'Forgot to clock out'], $r1);
        $this->assertSame('ATT-0001', $att->number);
    }

    public function test_unknown_form_is_rejected(): void
    {
        $c = $this->company('C1');
        $requester = $this->requester($c);
        Sanctum::actingAs($requester);

        try {
            $this->service()->create('does-not-exist', [], $requester);
            $this->fail('Expected a 422 abort.');
        } catch (HttpExceptionInterface $e) {
            $this->assertSame(422, $e->getStatusCode());
        }
    }

    // ── Approval ──────────────────────────────────────────────────────────────────

    public function test_approver_can_approve_the_submission(): void
    {
        $c = $this->company('C1');
        $requester = $this->requester($c);
        $approver = $this->approver($c);

        Sanctum::actingAs($requester);
        $submission = $this->service()->create('leave', $this->leaveData(), $requester);

        Sanctum::actingAs($approver);
        app(WorkflowEngine::class)->apply($submission, 'approve', $approver);

        $this->assertSame('approved', $submission->fresh()->workflow_state);
        $this->assertSame('resolved', $submission->fresh()->state_category);
        $this->assertDatabaseHas('workflow_approvals', [
            'approvable_id' => $submission->id, 'status' => 'approved', 'decided_by' => $approver->id,
        ]);
    }

    public function test_requester_cannot_approve_their_own_submission(): void
    {
        $c = $this->company('C1');
        // Requester also holds the approver role, but prevent_self must still block them.
        $requester = $this->approver($c);

        Sanctum::actingAs($requester);
        $submission = $this->service()->create('leave', $this->leaveData(), $requester);

        try {
            app(WorkflowEngine::class)->apply($submission, 'approve', $requester);
            $this->fail('Expected a 403 abort.');
        } catch (HttpExceptionInterface $e) {
            $this->assertSame(403, $e->getStatusCode());
        }
    }
}
