<?php

namespace App\Services;

use App\Core\Tenancy\CompanyScope;
use App\Models\AuditLog;
use App\Models\Branch;
use App\Models\Department;
use App\Models\User;
use App\Models\UserRoleAssignment;

/**
 * Applies the security consequences of moving a user between companies (per the locked
 * plan, §8): role assignments scoped to the OLD company — company/branch/department —
 * are revoked, live tokens are invalidated, and the move is audited. Global grants and
 * grants into other companies are left untouched.
 *
 * Call AFTER the user's company_id has been updated; pass the previous company_id.
 */
class UserCompanyTransfer
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function handleMove(User $user, ?int $oldCompanyId): void
    {
        $newCompanyId = $user->company_id;

        if ((int) $oldCompanyId === (int) $newCompanyId) {
            return; // not an actual move
        }

        $revoked = 0;

        if ($oldCompanyId !== null) {
            $branchIds = Branch::withoutGlobalScope(CompanyScope::class)
                ->where('company_id', $oldCompanyId)->pluck('id')->all();
            $deptIds = Department::withoutGlobalScope(CompanyScope::class)
                ->where('company_id', $oldCompanyId)->pluck('id')->all();

            $stale = $user->roleAssignments()
                ->where(function ($q) use ($oldCompanyId, $branchIds, $deptIds) {
                    $q->where(fn ($w) => $w
                        ->where('scope_type', UserRoleAssignment::SCOPE_COMPANY)
                        ->where('scope_id', $oldCompanyId));

                    if (! empty($branchIds)) {
                        $q->orWhere(fn ($w) => $w
                            ->where('scope_type', UserRoleAssignment::SCOPE_BRANCH)
                            ->whereIn('scope_id', $branchIds));
                    }

                    if (! empty($deptIds)) {
                        $q->orWhere(fn ($w) => $w
                            ->where('scope_type', UserRoleAssignment::SCOPE_DEPARTMENT)
                            ->whereIn('scope_id', $deptIds));
                    }
                })
                ->get();

            $revoked = $stale->count();

            // Delete per-model so UserRoleAssignmentObserver fires and each revocation is
            // written to the audit trail (a bulk delete would skip the observer).
            $stale->each->delete();

            // Rebuild the flat Spatie model from what remains across all scopes.
            $user->syncFlatRolesFromAssignments();
        }

        // A company change invalidates the company/permission context cached behind any
        // live token — force re-authentication.
        $user->tokens()->delete();

        $this->audit->log(AuditLog::ACTION_USER_COMPANY_CHANGED, $user, [
            'from_company_id' => $oldCompanyId,
            'to_company_id' => $newCompanyId,
            'revoked_assignments' => $revoked,
        ]);
    }
}
