<?php

namespace Tests\Fixtures;

use App\Core\Workflow\HasWorkflow;
use App\Core\Workflow\TracksWorkflow;
use Illuminate\Database\Eloquent\Model;

/**
 * A minimal HasWorkflow record used to exercise the entity-agnostic engine without
 * depending on a concrete module. Backed by the `workflow_subjects` table created in the
 * engine test's setUp; registered in the morph map there as 'workflow_subject'.
 */
class WorkflowSubject extends Model implements HasWorkflow
{
    use TracksWorkflow;

    protected $table = 'workflow_subjects';

    protected $guarded = [];

    protected $casts = [
        'company_id' => 'integer',
        'branch_id' => 'integer',
        'department_id' => 'integer',
        'requester_id' => 'integer',
        'workflow_version_id' => 'integer',
    ];

    public function workflowEntityType(): string
    {
        return 'submission';
    }

    public function workflowSlug(): string
    {
        return $this->getAttribute('wf_slug') ?? 'default';
    }
}
