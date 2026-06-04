<?php

namespace App\Core\Workflow;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Per-config change ledger (publish/activate/deactivate). Polymorphic so it serves every
 * SharedConfig surface; append-only. Distinct from audit_logs (global compliance) — this is
 * the focused version history a config surface renders.
 */
class ConfigRevision extends Model
{
    public $timestamps = false;

    public const ACTION_PUBLISHED = 'published';

    public const ACTION_ACTIVATED = 'activated';

    public const ACTION_DEACTIVATED = 'deactivated';

    protected $fillable = [
        'configurable_type', 'configurable_id', 'action', 'version', 'actor_id', 'metadata', 'created_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'version' => 'integer',
        'created_at' => 'datetime',
    ];

    public function configurable(): MorphTo
    {
        return $this->morphTo();
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
