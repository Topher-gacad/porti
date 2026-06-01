<?php

namespace App\Services;

use App\Models\Branch;
use App\Models\Department;
use App\Models\Scopes\CompanyScope;
use App\Models\User;
use App\Models\UserRoleAssignment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * Resolves the set of tenants (companies / branches / departments) a user is
 * allowed to act on, and enforces that non-privileged actors cannot assign
 * tenant foreign keys outside that set.
 *
 * CompanyScope governs what a tenant can READ; this service governs what a
 * tenant may WRITE. Super-admins and developers bypass both.
 */
class TenantAccess
{
    private const PRIVILEGED_ROLES = ['super-admin', 'developer'];

    public function isPrivileged(User $user): bool
    {
        return $user->hasAnyRole(self::PRIVILEGED_ROLES);
    }

    /**
     * Companies the actor may act on: their own company plus any company they
     * hold a company-scoped role assignment for.
     *
     * @return list<int>
     */
    public function allowedCompanyIds(User $user): array
    {
        return $this->resolveAllowed($user, UserRoleAssignment::SCOPE_COMPANY, $user->company_id);
    }

    /**
     * @return list<int>
     */
    public function allowedBranchIds(User $user): array
    {
        return $this->resolveAllowed($user, UserRoleAssignment::SCOPE_BRANCH, $user->branch_id);
    }

    /**
     * @return list<int>
     */
    public function allowedDepartmentIds(User $user): array
    {
        return $this->resolveAllowed($user, UserRoleAssignment::SCOPE_DEPARTMENT, $user->department_id);
    }

    /**
     * Guard the tenant foreign keys (company_id / branch_id / department_id) in
     * a create/update payload. Privileged actors are unrestricted. For everyone
     * else: a supplied company_id must be within their allowed companies, and a
     * supplied branch/department must belong to the resolved company so it can
     * never reference another tenant's records.
     *
     * @param  array<string, mixed>  $data  The validated request payload.
     * @param  Model|null  $existing  The record being updated, if any.
     */
    public function assertTenantAssignment(User $actor, array $data, ?Model $existing = null): void
    {
        if ($this->isPrivileged($actor)) {
            return;
        }

        $companyId = $data['company_id']
            ?? $existing?->company_id
            ?? $actor->company_id;

        if (array_key_exists('company_id', $data) && $data['company_id'] !== null) {
            abort_unless(
                in_array($data['company_id'], $this->allowedCompanyIds($actor)),
                403,
                'You do not have access to the requested company.',
            );
        }

        // A non-privileged actor may not null out an existing record's company,
        // which would orphan it out of every tenant scope (incl. their own).
        if (array_key_exists('company_id', $data)
            && $data['company_id'] === null
            && $existing?->company_id !== null) {
            abort(403, 'You cannot remove this record from its company.');
        }

        if (array_key_exists('branch_id', $data) && $data['branch_id'] !== null) {
            $branch = Branch::withoutGlobalScope(CompanyScope::class)->find($data['branch_id']);
            abort_if(
                $branch === null || (int) $branch->company_id !== (int) $companyId,
                403,
                'The selected branch does not belong to this company.',
            );
        }

        if (array_key_exists('department_id', $data) && $data['department_id'] !== null) {
            $department = Department::withoutGlobalScope(CompanyScope::class)->find($data['department_id']);
            abort_if(
                $department === null || (int) $department->company_id !== (int) $companyId,
                403,
                'The selected department does not belong to this company.',
            );
        }
    }

    /**
     * The actor's own id (when set) plus any scope_ids granted to them via
     * scoped role assignments of the given type.
     *
     * @return list<int>
     */
    private function resolveAllowed(User $user, string $scopeType, ?int $ownId): array
    {
        $ids = array_filter([$ownId]);

        $fromAssignments = DB::table('user_role_assignments')
            ->where('user_id', $user->id)
            ->where('scope_type', $scopeType)
            ->whereNotNull('scope_id')
            ->pluck('scope_id')
            ->all();

        return array_values(array_unique(array_map('intval', array_merge($ids, $fromAssignments))));
    }
}
