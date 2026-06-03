<?php

namespace App\Models;

use App\Core\Tenancy\SharedConfig;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A launcher tile in the apps catalog (table `apps`).
 *
 * This is CONFIG, not a tenant record: it uses SharedConfig (global-default +
 * per-company-override), never BelongsToCompany. A NULL company_id is a global tile
 * shown to every company; a non-null company_id is a subsidiary-specific tile or a
 * per-company override of a global one (linked via derived_from_id).
 *
 * Named PortalApp (not App) to avoid colliding with the App\ namespace root / App facade.
 */
class PortalApp extends Model
{
    use SharedConfig;

    protected $table = 'apps';

    public const KIND_NATIVE = 'native';

    public const KIND_EXTERNAL_SSO = 'external_sso';

    protected $fillable = [
        'company_id', 'derived_from_id',
        'key', 'kind', 'name', 'description', 'icon', 'url',
        'sort_order', 'is_active',
    ];

    protected $casts = [
        'company_id' => 'integer',
        'derived_from_id' => 'integer',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
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
