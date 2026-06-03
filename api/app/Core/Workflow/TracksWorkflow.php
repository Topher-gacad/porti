<?php

namespace App\Core\Workflow;

use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * Default wiring for a HasWorkflow record: the polymorphic activity/approval relations and
 * a workflowContext() derived from the model's tenancy columns. A model still declares its
 * own workflowEntityType() and workflowSlug().
 */
trait TracksWorkflow
{
    public function workflowApprovals(): MorphMany
    {
        return $this->morphMany(WorkflowApproval::class, 'approvable');
    }

    public function activityEvents(): MorphMany
    {
        return $this->morphMany(ActivityEvent::class, 'subject');
    }

    public function pendingApproval(): ?WorkflowApproval
    {
        return $this->workflowApprovals()
            ->where('status', WorkflowApproval::STATUS_PENDING)
            ->latest('id')
            ->first();
    }

    /**
     * @return array{company_id: int|null, branch_id: int|null, department_id: int|null}
     */
    public function workflowContext(): array
    {
        return [
            'company_id' => $this->company_id ?? null,
            'branch_id' => $this->branch_id ?? null,
            'department_id' => $this->department_id ?? null,
        ];
    }
}
