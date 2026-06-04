<?php

namespace App\Core\Tenancy;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Resolves which CONFIG row the engine APPLIES for a given record:
 * the record's company-specific override if one exists, else the global default.
 *
 * Always runs with ConfigVisibilityScope DISABLED and keys off the *record's* company
 * (passed in explicitly) — never the acting user's visibility. This is the read path the
 * workflow engine, SLA lookup, form rendering, and apps launcher use. Browsing in the
 * admin UI uses ConfigVisibilityScope instead.
 */
class ConfigResolver
{
    /**
     * @param  class-string<Model>  $modelClass  a model using the SharedConfig trait
     * @param  array<string,mixed>  $match  domain-key constraints, e.g. ['entity_type' => 'submission', 'slug' => 'leave']
     * @param  int|null  $companyId  the record's company id (null → resolve the global default only)
     * @param  Closure(Builder):void|null  $constrain  extra constraints (e.g. ->where('is_active', true)->orderByDesc('version'))
     */
    public function resolve(string $modelClass, array $match, ?int $companyId, ?Closure $constrain = null): ?Model
    {
        // 1. company-specific override
        if ($companyId !== null) {
            $row = $this->base($modelClass, $match, $constrain)
                ->where('company_id', $companyId)
                ->first();

            if ($row) {
                return $row;
            }
        }

        // 2. global default
        return $this->base($modelClass, $match, $constrain)
            ->whereNull('company_id')
            ->first();
    }

    /**
     * @param  class-string<Model>  $modelClass
     * @param  array<string,mixed>  $match
     */
    private function base(string $modelClass, array $match, ?Closure $constrain): Builder
    {
        /** @var Builder $query */
        $query = $modelClass::withoutGlobalScope(ConfigVisibilityScope::class)->where($match);

        if ($constrain) {
            $constrain($query);
        }

        return $query;
    }
}
