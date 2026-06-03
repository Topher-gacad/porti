<?php

namespace Database\Seeders;

use App\Core\Tenancy\ConfigVisibilityScope;
use App\Core\Workflow\Workflow;
use App\Core\Workflow\WorkflowPublisher;
use App\Modules\Submissions\FormDefinition;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Ships Leave and Attendance-correction as GLOBAL-DEFAULT forms (company_id NULL), the proof
 * that "a new request type = a form_definitions row + a workflows row" with zero new code.
 * Both are light 1-step approvals; the initial state is the approval gate, so creating a
 * submission immediately opens its approval.
 */
class SubmissionFormSeeder extends Seeder
{
    public function run(): void
    {
        // Coarse approver permission (§6) — differentiate WHO by role + scope, not by slug.
        $approve = Permission::firstOrCreate(['name' => 'submissions.approve', 'guard_name' => 'web']);
        foreach (['super-admin', 'developer', 'company-admin', 'branch-manager'] as $roleName) {
            Role::where('name', $roleName)->where('guard_name', 'web')->first()?->givePermissionTo($approve);
        }

        $this->approvalWorkflow('leave', 'Leave Request');
        $this->approvalWorkflow('attendance-correction', 'Attendance Correction');

        $this->form('leave', 'Leave', 'calendar', 'LEAVE-', [
            ['key' => 'leave_type', 'type' => 'select', 'label' => 'Leave type', 'required' => true, 'options' => ['annual', 'sick', 'unpaid']],
            ['key' => 'start_date', 'type' => 'date', 'label' => 'Start date', 'required' => true],
            ['key' => 'end_date', 'type' => 'date', 'label' => 'End date', 'required' => true],
            ['key' => 'days', 'type' => 'integer', 'label' => 'Working days', 'required' => true, 'min' => 1, 'max' => 60],
            ['key' => 'reason', 'type' => 'textarea', 'label' => 'Reason', 'required' => true],
        ]);

        $this->form('attendance-correction', 'Attendance Correction', 'clock', 'ATT-', [
            ['key' => 'work_date', 'type' => 'date', 'label' => 'Date', 'required' => true],
            ['key' => 'correct_time_in', 'type' => 'datetime', 'label' => 'Correct time in', 'required' => false],
            ['key' => 'correct_time_out', 'type' => 'datetime', 'label' => 'Correct time out', 'required' => false],
            ['key' => 'reason', 'type' => 'textarea', 'label' => 'Reason', 'required' => true],
        ]);
    }

    private function approvalWorkflow(string $slug, string $name): void
    {
        $exists = Workflow::withoutGlobalScope(ConfigVisibilityScope::class)
            ->whereNull('company_id')->where('entity_type', 'submission')->where('slug', $slug)->exists();
        if ($exists) {
            return;
        }

        $wf = Workflow::withoutGlobalScope(ConfigVisibilityScope::class)->create([
            'company_id' => null, 'entity_type' => 'submission', 'slug' => $slug, 'name' => $name,
        ]);

        $review = $wf->states()->create(['name' => 'Awaiting Approval', 'slug' => 'awaiting_approval', 'category' => 'in_progress', 'is_initial' => true, 'is_approval_gate' => true]);
        $approved = $wf->states()->create(['name' => 'Approved', 'slug' => 'approved', 'category' => 'resolved', 'is_terminal' => true]);
        $rejected = $wf->states()->create(['name' => 'Rejected', 'slug' => 'rejected', 'category' => 'cancelled', 'is_terminal' => true]);

        $wf->transitions()->create(['from_state_id' => $review->id, 'to_state_id' => $approved->id, 'name' => 'Approve', 'slug' => 'approve', 'required_permission' => 'submissions.approve', 'scope_level' => 'company', 'prevent_self' => true]);
        $wf->transitions()->create(['from_state_id' => $review->id, 'to_state_id' => $rejected->id, 'name' => 'Reject', 'slug' => 'reject', 'required_permission' => 'submissions.approve', 'scope_level' => 'company', 'prevent_self' => true, 'requires_comment' => true]);

        app(WorkflowPublisher::class)->publishAndActivate($wf->fresh(['states', 'transitions']));
    }

    private function form(string $key, string $name, string $icon, string $series, array $schema): void
    {
        FormDefinition::withoutGlobalScope(ConfigVisibilityScope::class)->updateOrCreate(
            ['key' => $key, 'company_id' => null, 'version' => 1],
            [
                'name' => $name, 'icon' => $icon, 'field_schema' => $schema,
                'workflow_key' => $key, 'naming_series' => $series, 'status' => FormDefinition::STATUS_PUBLISHED,
            ],
        );
    }
}
