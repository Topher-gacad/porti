<?php

namespace App\Models\Concerns;

use App\Models\Scopes\CompanyScope;
use Illuminate\Database\Eloquent\Builder;

trait BelongsToCompany
{
    public static function bootBelongsToCompany(): void
    {
        static::addGlobalScope(new CompanyScope());

        static::creating(function (self $model): void {
            if (auth()->check() && empty($model->company_id)) {
                $model->company_id = auth()->user()->company_id;
            }
        });
    }

    // Escape hatch for admin operations that must cross tenant boundaries.
    public static function forCompany(int $companyId): Builder
    {
        return static::withoutGlobalScope(CompanyScope::class)
            ->where('company_id', $companyId);
    }
}
