<?php

namespace App\Core\Workflow;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * An immutable published snapshot of a workflow's graph. Records pin a workflow_version_id
 * at creation and finish on that version even after the editable workflow changes.
 */
class WorkflowVersion extends Model
{
    protected $fillable = [
        'workflow_id', 'version', 'graph_snapshot', 'is_active', 'published_at', 'published_by',
    ];

    protected $casts = [
        'graph_snapshot' => 'array',
        'is_active' => 'boolean',
        'version' => 'integer',
        'published_at' => 'datetime',
    ];

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }

    public function publishedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by');
    }
}
