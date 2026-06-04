<?php

namespace App\Core\Workflow;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A gated edge between two states. The gate combines a scoped permission
 * (required_permission narrowed to scope_level), optional allowed_role_names, prevent_self,
 * requires_comment, and an optional `condition` resolved against the closed ConditionRegistry
 * (never eval).
 */
class WorkflowTransition extends Model
{
    public const SCOPE_LEVELS = ['department', 'branch', 'company', 'global'];

    protected $fillable = [
        'workflow_id', 'from_state_id', 'to_state_id', 'name', 'slug',
        'required_permission', 'scope_level', 'allowed_role_names',
        'prevent_self', 'requires_comment', 'condition', 'sort_order',
    ];

    protected $casts = [
        'allowed_role_names' => 'array',
        'prevent_self' => 'boolean',
        'requires_comment' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }

    public function fromState(): BelongsTo
    {
        return $this->belongsTo(WorkflowState::class, 'from_state_id');
    }

    public function toState(): BelongsTo
    {
        return $this->belongsTo(WorkflowState::class, 'to_state_id');
    }
}
