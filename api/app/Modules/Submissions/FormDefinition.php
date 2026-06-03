<?php

namespace App\Modules\Submissions;

use App\Core\Tenancy\SharedConfig;
use App\Models\Company;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A configurable form (CONFIG: SharedConfig global-default + per-company-override). Its
 * field_schema is an ordered list of fields from the closed FieldTypeRegistry; workflow_key
 * binds it to a 'submission' workflow. Published versions are immutable references — a
 * submission snapshots form_definition_version at creation.
 */
class FormDefinition extends Model
{
    use SharedConfig;

    public const STATUS_DRAFT = 'draft';

    public const STATUS_PUBLISHED = 'published';

    protected $fillable = [
        'company_id', 'derived_from_id', 'key', 'name', 'icon',
        'field_schema', 'workflow_key', 'naming_series', 'version', 'status',
    ];

    protected $casts = [
        'company_id' => 'integer',
        'derived_from_id' => 'integer',
        'field_schema' => 'array',
        'version' => 'integer',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function derivedFrom(): BelongsTo
    {
        return $this->belongsTo(self::class, 'derived_from_id');
    }
}
