<?php

namespace Tests\Feature;

use App\Core\Tenancy\ConfigVisibilityScope;
use App\Core\Workflow\ConditionRegistry;
use App\Core\Workflow\Workflow;
use App\Core\Workflow\WorkflowEngine;
use App\Core\Workflow\WorkflowPublisher;
use App\Models\AuditLog;
use App\Models\Company;
use App\Models\User;
use App\Models\UserRoleAssignment;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Tests\Fixtures\WorkflowSubject;
use Tests\TestCase;

/**
 * Phase 2c: the WorkflowEngine — version pinning, the transition gate (scoped permission +
 * role + condition + prevent_self + requires_comment, super-admin bypass), approval gates,
 * and the dual activity-event + audit trail.
 */
class WorkflowEngineTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);

        // Register the test record in the (enforced) morph map.
        Relation::morphMap(['workflow_subject' => WorkflowSubject::class]);

        Schema::create('workflow_subjects', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id')->nullable();
            $table->unsignedBigInteger('branch_id')->nullable();
            $table->unsignedBigInteger('department_id')->nullable();
            $table->unsignedBigInteger('requester_id')->nullable();
            $table->string('wf_slug')->default('default');
            $table->string('workflow_state')->nullable();
            $table->string('state_category')->nullable();
            $table->unsignedBigInteger('workflow_version_id')->nullable();
            $table->timestamps();
        });

        // A condition guard used by the condition test.
        app(ConditionRegistry::class)->register('never', fn ($r, $a) => false);
    }

    private function company(string $code): Company
    {
        return Company::create(['name' => "Company $code", 'code' => $code, 'is_active' => true]);
    }

    /** Build + publish + activate a submission workflow: draft → review(gate) → approved | rejected. */
    private function publishWorkflow(?int $companyId = null): void
    {
        $wf = Workflow::withoutGlobalScope(ConfigVisibilityScope::class)->create([
            'company_id' => $companyId, 'entity_type' => 'submission', 'slug' => 'default', 'name' => 'Leave',
        ]);

        $draft = $wf->states()->create(['name' => 'Draft', 'slug' => 'draft', 'category' => 'open', 'is_initial' => true]);
        $review = $wf->states()->create(['name' => 'In Review', 'slug' => 'review', 'category' => 'in_progress', 'is_approval_gate' => true]);
        $approved = $wf->states()->create(['name' => 'Approved', 'slug' => 'approved', 'category' => 'resolved', 'is_terminal' => true]);
        $rejected = $wf->states()->create(['name' => 'Rejected', 'slug' => 'rejected', 'category' => 'cancelled', 'is_terminal' => true]);

        $wf->transitions()->create(['from_state_id' => $draft->id, 'to_state_id' => $review->id, 'name' => 'Submit', 'slug' => 'submit']);
        $wf->transitions()->create(['from_state_id' => $review->id, 'to_state_id' => $approved->id, 'name' => 'Approve', 'slug' => 'approve', 'required_permission' => 'submissions.approve', 'scope_level' => 'company', 'prevent_self' => true]);
        $wf->transitions()->create(['from_state_id' => $review->id, 'to_state_id' => $rejected->id, 'name' => 'Reject', 'slug' => 'reject', 'required_permission' => 'submissions.approve', 'scope_level' => 'company', 'requires_comment' => true]);
        $wf->transitions()->create(['from_state_id' => $draft->id, 'to_state_id' => $rejected->id, 'name' => 'Block', 'slug' => 'block', 'condition' => 'never']);

        app(WorkflowPublisher::class)->publishAndActivate($wf->fresh(['states', 'transitions']));
    }

    private function approver(Company $c): User
    {
        $perm = Permission::firstOrCreate(['name' => 'submissions.approve', 'guard_name' => 'web']);
        $role = Role::firstOrCreate(['name' => 'submissions.agent', 'guard_name' => 'web']);
        $role->givePermissionTo($perm);

        $user = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);
        UserRoleAssignment::create(['user_id' => $user->id, 'role_id' => $role->id, 'scope_type' => 'company', 'scope_id' => $c->id]);
        $this->assignRole($user, 'submissions.agent');

        return $user;
    }

    private function subject(Company $c, ?int $requesterId = null): WorkflowSubject
    {
        return WorkflowSubject::create(['company_id' => $c->id, 'requester_id' => $requesterId]);
    }

    private function engine(): WorkflowEngine
    {
        return app(WorkflowEngine::class);
    }

    private function assertAborts(int $status, callable $fn): void
    {
        try {
            $fn();
            $this->fail("Expected an HTTP {$status} abort.");
        } catch (HttpExceptionInterface $e) {
            $this->assertSame($status, $e->getStatusCode());
        }
    }

    // ── Start / pinning ─────────────────────────────────────────────────────────

    public function test_start_pins_version_and_sets_initial_state(): void
    {
        $c = $this->company('C1');
        $this->publishWorkflow();
        $record = $this->subject($c);

        $this->engine()->start($record);

        $this->assertSame('draft', $record->workflow_state);
        $this->assertSame('open', $record->state_category);
        $this->assertNotNull($record->workflow_version_id);
        $this->assertDatabaseHas('activity_events', ['subject_type' => 'workflow_subject', 'verb' => 'workflow.started']);
        $this->assertDatabaseHas('audit_logs', ['action' => AuditLog::ACTION_WORKFLOW_STARTED]);
    }

    public function test_start_without_a_resolvable_workflow_throws(): void
    {
        $c = $this->company('C1'); // no workflow published
        $record = $this->subject($c);

        $this->assertAborts(422, fn () => $this->engine()->start($record));
    }

    // ── Happy-path transition + trail ────────────────────────────────────────────

    public function test_apply_moves_state_and_writes_both_trails(): void
    {
        $c = $this->company('C1');
        $this->publishWorkflow();
        $record = $this->subject($c);
        $this->engine()->start($record);

        $this->engine()->apply($record, 'submit', $this->approver($c));

        $this->assertSame('review', $record->fresh()->workflow_state);
        $this->assertSame('in_progress', $record->fresh()->state_category);
        $this->assertDatabaseHas('activity_events', ['verb' => 'workflow.transitioned']);
        $this->assertDatabaseHas('audit_logs', ['action' => AuditLog::ACTION_WORKFLOW_TRANSITIONED]);
    }

    public function test_invalid_transition_from_current_state_is_rejected(): void
    {
        $c = $this->company('C1');
        $this->publishWorkflow();
        $record = $this->subject($c);
        $this->engine()->start($record); // in 'draft'

        // 'approve' leaves 'review', not 'draft'.
        $this->assertAborts(422, fn () => $this->engine()->apply($record, 'approve', $this->approver($c)));
    }

    // ── Approval gate ─────────────────────────────────────────────────────────────

    public function test_entering_an_approval_gate_opens_a_pending_approval(): void
    {
        $c = $this->company('C1');
        $this->publishWorkflow();
        $record = $this->subject($c);
        $this->engine()->start($record);

        $this->engine()->apply($record, 'submit', $this->approver($c));

        $this->assertDatabaseHas('workflow_approvals', [
            'approvable_type' => 'workflow_subject', 'approvable_id' => $record->id,
            'state_slug' => 'review', 'status' => 'pending',
        ]);
    }

    public function test_approve_resolves_the_pending_approval(): void
    {
        $c = $this->company('C1');
        $this->publishWorkflow();
        $approver = $this->approver($c);
        $record = $this->subject($c);
        $this->engine()->start($record);
        $this->engine()->apply($record, 'submit', $approver);

        $this->engine()->apply($record, 'approve', $approver);

        $this->assertSame('resolved', $record->fresh()->state_category);
        $this->assertDatabaseHas('workflow_approvals', [
            'approvable_id' => $record->id, 'state_slug' => 'review',
            'status' => 'approved', 'decided_by' => $approver->id,
        ]);
    }

    public function test_reject_into_cancelled_marks_the_approval_rejected(): void
    {
        $c = $this->company('C1');
        $this->publishWorkflow();
        $approver = $this->approver($c);
        $record = $this->subject($c);
        $this->engine()->start($record);
        $this->engine()->apply($record, 'submit', $approver);

        $this->engine()->apply($record, 'reject', $approver, 'Insufficient detail');

        $this->assertSame('cancelled', $record->fresh()->state_category);
        $this->assertDatabaseHas('workflow_approvals', [
            'approvable_id' => $record->id, 'status' => 'rejected',
        ]);
    }

    // ── Gating ────────────────────────────────────────────────────────────────────

    public function test_actor_without_permission_is_forbidden(): void
    {
        $c = $this->company('C1');
        $this->publishWorkflow();
        $record = $this->subject($c);
        $this->engine()->start($record);
        $this->engine()->apply($record, 'submit', $this->approver($c));

        $nobody = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);
        $this->assignRole($nobody, 'user');

        $this->assertAborts(403, fn () => $this->engine()->apply($record, 'approve', $nobody));
        $this->assertSame('review', $record->fresh()->workflow_state);
    }

    public function test_permission_in_wrong_company_scope_is_forbidden(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');
        $this->publishWorkflow();
        $record = $this->subject($c1);
        $this->engine()->start($record);

        // Approver is scoped to C2, but the record is in C1.
        $wrongScope = $this->approver($c2);
        $this->engine()->apply($record, 'submit', $this->approver($c1));

        $this->assertAborts(403, fn () => $this->engine()->apply($record, 'approve', $wrongScope));
    }

    public function test_super_admin_bypasses_the_permission_gate(): void
    {
        $c = $this->company('C1');
        $this->publishWorkflow();
        $admin = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);
        $this->assignRole($admin, 'super-admin');

        $record = $this->subject($c);
        $this->engine()->start($record);
        $this->engine()->apply($record, 'submit', $admin);
        $this->engine()->apply($record, 'approve', $admin);

        $this->assertSame('approved', $record->fresh()->workflow_state);
    }

    public function test_prevent_self_blocks_acting_on_own_record(): void
    {
        $c = $this->company('C1');
        $this->publishWorkflow();
        $approver = $this->approver($c);
        // The record's requester IS the approver.
        $record = $this->subject($c, requesterId: $approver->id);
        $this->engine()->start($record);
        $this->engine()->apply($record, 'submit', $approver);

        $this->assertAborts(403, fn () => $this->engine()->apply($record, 'approve', $approver));
    }

    public function test_requires_comment_is_enforced(): void
    {
        $c = $this->company('C1');
        $this->publishWorkflow();
        $approver = $this->approver($c);
        $record = $this->subject($c);
        $this->engine()->start($record);
        $this->engine()->apply($record, 'submit', $approver);

        // 'reject' requires a comment.
        $this->assertAborts(422, fn () => $this->engine()->apply($record, 'reject', $approver));
    }

    public function test_condition_guard_blocks_a_transition(): void
    {
        $c = $this->company('C1');
        $this->publishWorkflow();
        $admin = User::factory()->create(['company_id' => $c->id, 'is_active' => true]);
        $this->assignRole($admin, 'super-admin');

        $record = $this->subject($c);
        $this->engine()->start($record); // in 'draft'; 'block' has condition 'never'

        // Even a super-admin cannot pass a failing condition (integrity rule, not authz).
        $this->assertAborts(403, fn () => $this->engine()->apply($record, 'block', $admin));
    }

    public function test_available_transitions_reflect_the_gate(): void
    {
        $c = $this->company('C1');
        $this->publishWorkflow();
        $approver = $this->approver($c);
        $record = $this->subject($c);
        $this->engine()->start($record);
        $this->engine()->apply($record, 'submit', $approver);

        $slugs = collect($this->engine()->availableTransitions($record->fresh(), $approver))->pluck('slug')->all();

        // From 'review' the approver may approve and reject.
        $this->assertEqualsCanonicalizing(['approve', 'reject'], $slugs);
    }
}
