<?php

namespace App\Models\Scopes;

use App\Models\CrossTenantGrant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class CompanyScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        if (!auth()->check()) {
            return;
        }

        $user = auth()->user();

        if ($user->hasAnyRole(['super-admin', 'developer'])) {
            return;
        }

        $builder->whereIn(
            $model->getTable() . '.company_id',
            $this->allowedCompanyIds($user),
        );
    }

    private function allowedCompanyIds($user): array
    {
        $ids = array_filter([$user->company_id]);

        $teamIds = $user->teams()->pluck('teams.id')->toArray();

        $granted = CrossTenantGrant::active()
            ->where(function ($q) use ($user, $teamIds) {
                $q->where(function ($q) use ($user) {
                    $q->where('grantee_type', 'user')->where('grantee_id', $user->id);
                });
                if (!empty($teamIds)) {
                    $q->orWhere(function ($q) use ($teamIds) {
                        $q->where('grantee_type', 'team')->whereIn('grantee_id', $teamIds);
                    });
                }
            })
            ->pluck('target_company_id')
            ->filter()
            ->toArray();

        return array_unique(array_merge($ids, $granted));
    }
}
