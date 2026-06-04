<?php

namespace App\Modules\Submissions;

use App\Core\Tenancy\BelongsToCompany;
use App\Core\Workflow\HasWorkflow;
use App\Core\Workflow\TracksWorkflow;
use App\Models\Branch;
use App\Models\Department;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A Tier-1 form submission — tenant DATA (BelongsToCompany / CompanyScope), and a
 * HasWorkflow record bound to its form's workflow_key. The payload lives in one typed JSON
 * `data` column validated against the snapshotted form schema.
 */
class Submission extends Model implements HasWorkflow
{
    use BelongsToCompany, TracksWorkflow;

    protected $fillable = [
        'company_id', 'branch_id', 'department_id',
        'form_definition_id', 'form_definition_version',
        'entity_type', 'workflow_key', 'number',
        'requester_id', 'assignee_id', 'assigned_team_id',
        'workflow_state', 'state_category', 'workflow_version_id',
        'data',
    ];

    protected $casts = [
        'company_id' => 'integer',
        'branch_id' => 'integer',
        'department_id' => 'integer',
        'form_definition_version' => 'integer',
        'workflow_version_id' => 'integer',
        'requester_id' => 'integer',
        'assignee_id' => 'integer',
        'assigned_team_id' => 'integer',
        'data' => 'array',
    ];

    public function workflowEntityType(): string
    {
        return $this->entity_type ?? 'submission';
    }

    public function workflowSlug(): string
    {
        return $this->workflow_key;
    }

    public function formDefinition(): BelongsTo
    {
        return $this->belongsTo(FormDefinition::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function assignedTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'assigned_team_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }
}
