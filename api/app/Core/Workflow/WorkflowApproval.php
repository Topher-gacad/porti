<?php

namespace App\Core\Workflow;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * An approval gate opened against a record when it enters an is_approval_gate state.
 * "Awaiting approval" is derived from a pending row — approval is a gate, not a status.
 */
class WorkflowApproval extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'approvable_type', 'approvable_id', 'state_slug',
        'status', 'decided_by', 'decided_at', 'comment',
    ];

    protected $casts = [
        'decided_at' => 'datetime',
    ];

    public function approvable(): MorphTo
    {
        return $this->morphTo();
    }

    public function decidedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'decided_by');
    }
}
