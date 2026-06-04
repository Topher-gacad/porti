<?php

namespace App\Core\Workflow;

use App\Core\Tenancy\SharedConfig;
use App\Models\Company;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * A configurable workflow definition. CONFIG (SharedConfig: global-default +
 * per-company-override), keyed by (entity_type, slug) within a company tier. The editable
 * definition lives in its states/transitions; publishing freezes a WorkflowVersion.
 */
class Workflow extends Model
{
    use SharedConfig;

    protected $fillable = ['company_id', 'derived_from_id', 'entity_type', 'slug', 'name'];

    protected $casts = [
        'company_id' => 'integer',
        'derived_from_id' => 'integer',
    ];

    public function states(): HasMany
    {
        return $this->hasMany(WorkflowState::class)->orderBy('sort_order');
    }

    public function transitions(): HasMany
    {
        return $this->hasMany(WorkflowTransition::class)->orderBy('sort_order');
    }

    public function versions(): HasMany
    {
        return $this->hasMany(WorkflowVersion::class);
    }

    public function activeVersion(): HasOne
    {
        return $this->hasOne(WorkflowVersion::class)->where('is_active', true);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function derivedFrom(): BelongsTo
    {
        return $this->belongsTo(self::class, 'derived_from_id');
    }

    public function initialState(): ?WorkflowState
    {
        return $this->states->firstWhere('is_initial', true);
    }
}
