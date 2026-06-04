<?php

namespace App\Core\Workflow;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A state in a workflow. The free-form `name` is a label; the fixed `category` (from the
 * CategoryRegistry spine for the workflow's entity_type) is what UI/SLA/reporting key off.
 * Children carry no tenancy — they inherit the parent workflow's company.
 */
class WorkflowState extends Model
{
    protected $fillable = [
        'workflow_id', 'name', 'slug', 'category',
        'is_initial', 'is_terminal', 'sla_pauses', 'is_approval_gate', 'sort_order',
    ];

    protected $casts = [
        'is_initial' => 'boolean',
        'is_terminal' => 'boolean',
        'sla_pauses' => 'boolean',
        'is_approval_gate' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }
}
