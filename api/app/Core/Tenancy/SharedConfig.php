<?php

namespace App\Core\Tenancy;

use Illuminate\Database\Eloquent\Builder;

/**
 * Marks a table as CONFIG that is global-default + per-company-override.
 *
 * Contrast with BelongsToCompany (record isolation):
 *   - attaches ConfigVisibilityScope (admits NULL = global-default rows to every tenant)
 *     instead of CompanyScope (which would hide NULLs and leak nothing back);
 *   - has NO `creating` auto-stamp hook, so a developer can author a NULL global default;
 *     per-company overrides set company_id explicitly via the clone-to-customize action.
 *
 * The owning row carries `company_id` (NULL = global) and `derived_from_id` (the global it
 * was cloned from). Children (e.g. workflow_states) carry no tenancy — they inherit it.
 *
 * Reads that pick the row to APPLY must go through ConfigResolver (scope-off, record's
 * company), not this scope.
 */
trait SharedConfig
{
    public static function bootSharedConfig(): void
    {
        static::addGlobalScope(new ConfigVisibilityScope);
    }

    /** Global defaults only (company_id IS NULL), scope disabled. */
    public static function globalDefaults(): Builder
    {
        return static::withoutGlobalScope(ConfigVisibilityScope::class)
            ->whereNull('company_id');
    }

    /** A single company's overrides only, scope disabled. */
    public static function forCompanyConfig(int $companyId): Builder
    {
        return static::withoutGlobalScope(ConfigVisibilityScope::class)
            ->where('company_id', $companyId);
    }

    /** True for a global default (shared by every company). */
    public function isGlobalDefault(): bool
    {
        return $this->company_id === null;
    }
}
