<?php

namespace App\Core\Tenancy;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/**
 * Visibility scope for CONFIG tables (workflows, apps, sla_policies, request_categories,
 * form_definitions, ...). Governs what an admin BROWSES:
 *
 *   - global defaults (company_id IS NULL) are visible to everyone,
 *   - plus the actor's own / granted company overrides,
 *   - never another company's overrides.
 *
 * Super-admin/developer bypass (they author and see everything).
 *
 * IMPORTANT: this is a *visibility* scope only. To resolve which config row the engine
 * APPLIES to a given record, use ConfigResolver — which runs with this scope DISABLED and
 * keys off the record's company, not the acting user's. Resolving config THROUGH this
 * scope is the subtlest bug in the design (it would pick up the actor's visibility).
 */
class ConfigVisibilityScope implements Scope
{
    use ResolvesAllowedCompanies;

    public function apply(Builder $builder, Model $model): void
    {
        if (! auth()->check()) {
            return;
        }

        $user = auth()->user();

        if ($user->hasAnyRole(['super-admin', 'developer'])) {
            return;
        }

        $table = $model->getTable();
        $allowed = $this->allowedCompanyIds($user, $this->userTeamIds($user));

        // Global defaults (NULL) are shared with every tenant; overrides only when allowed.
        $builder->where(function ($q) use ($table, $allowed) {
            $q->whereNull($table.'.company_id')
                ->orWhereIn($table.'.company_id', $allowed);
        });
    }
}
