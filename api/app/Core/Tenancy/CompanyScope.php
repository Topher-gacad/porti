<?php

namespace App\Core\Tenancy;

use App\Models\BranchAccessGrant;
use App\Models\CrossTenantGrant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class CompanyScope implements Scope
{
    // Tables where branch-level isolation is enforced when enabled on the company
    private const BRANCH_SCOPED_TABLES = ['users', 'departments'];

    public function apply(Builder $builder, Model $model): void
    {
        if (!auth()->check()) {
            return;
        }

        $user = auth()->user();

        if ($user->hasAnyRole(['super-admin', 'developer'])) {
            return;
        }

        // Query the pivot table directly to avoid recursive CompanyScope on Team model
        $teamIds = \DB::table('team_members')
            ->where('user_id', $user->id)
            ->pluck('team_id')
            ->toArray();

        $builder->whereIn(
            $model->getTable() . '.company_id',
            $this->allowedCompanyIds($user, $teamIds),
        );

        if (in_array($model->getTable(), self::BRANCH_SCOPED_TABLES)) {
            $this->applyBranchFilter($builder, $model, $user, $teamIds);
        }
    }

    private function allowedCompanyIds($user, array $teamIds): array
    {
        $ids = array_filter([$user->company_id]);

        // Company-scoped role assignments grant visibility to those companies
        $fromAssignments = \DB::table('user_role_assignments')
            ->where('user_id', $user->id)
            ->where('scope_type', 'company')
            ->whereNotNull('scope_id')
            ->pluck('scope_id')
            ->toArray();

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

        return array_unique(array_merge($ids, $fromAssignments, $granted));
    }

    private function applyBranchFilter(Builder $builder, Model $model, $user, array $teamIds): void
    {
        // Users without a branch assignment are company-level (see all branches)
        if (!$user->branch_id) {
            return;
        }

        // Load the user's company to check the isolation setting
        $company = $user->company;
        if (!$company || !$company->enforce_branch_isolation) {
            return;
        }

        $allowedBranchIds = $this->allowedBranchIds($user, $teamIds);
        $table = $model->getTable();

        // Records with no branch assignment are visible to all (e.g. company-level departments)
        $builder->where(function ($q) use ($table, $allowedBranchIds) {
            $q->whereNull($table . '.branch_id')
              ->orWhereIn($table . '.branch_id', $allowedBranchIds);
        });
    }

    private function allowedBranchIds($user, array $teamIds): array
    {
        $ids = array_filter([$user->branch_id]);

        // Branch-scoped role assignments grant visibility to those branches
        $fromAssignments = \DB::table('user_role_assignments')
            ->where('user_id', $user->id)
            ->where('scope_type', 'branch')
            ->whereNotNull('scope_id')
            ->pluck('scope_id')
            ->toArray();

        $granted = BranchAccessGrant::active()
            ->where('company_id', $user->company_id)
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
            ->pluck('branch_id')
            ->filter()
            ->toArray();

        return array_unique(array_merge($ids, $fromAssignments, $granted));
    }
}
