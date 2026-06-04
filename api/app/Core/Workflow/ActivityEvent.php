<?php

namespace App\Core\Workflow;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * The user-facing activity timeline (kernel Shared). Append-only; created_at only.
 */
class ActivityEvent extends Model
{
    public $timestamps = false;

    public const VERB_TRANSITIONED = 'workflow.transitioned';

    public const VERB_STARTED = 'workflow.started';

    protected $fillable = [
        'subject_type', 'subject_id', 'actor_id', 'verb', 'properties', 'created_at',
    ];

    protected $casts = [
        'properties' => 'array',
        'created_at' => 'datetime',
    ];

    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
