<?php

namespace App\Http\Controllers;

use App\Core\Tenancy\CompanyScope;
use App\Http\Requests\StoreCrossTenantGrantRequest;
use App\Models\AuditLog;
use App\Models\Branch;
use App\Models\CrossTenantGrant;
use App\Models\Department;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * Thin CRUD for cross-company access grants — super-admin/developer only
 * (CrossTenantGrantPolicy). A grant widens a user's/team's visible companies; the read
 * path consuming it lives in ResolvesAllowedCompanies / BasePolicy::inAllowedCompany.
 */
class CrossTenantGrantController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', CrossTenantGrant::class);

        $grants = CrossTenantGrant::query()
            ->with(['targetCompany:id,name', 'targetBranch:id,name', 'targetDepartment:id,name', 'grantedBy:id,name', 'permissions:id,name'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (CrossTenantGrant $g) => $this->format($g));

        return response()->json(['data' => $grants]);
    }

    public function store(StoreCrossTenantGrantRequest $request): JsonResponse
    {
        $this->authorize('create', CrossTenantGrant::class);

        $data = $request->validated();
        $companyId = (int) $data['target_company_id'];

        // A referenced branch/department must belong to the target company — exists:* alone
        // would otherwise let a grant point at another tenant's branch/department.
        if (! empty($data['target_branch_id'])) {
            abort_unless(
                Branch::withoutGlobalScope(CompanyScope::class)
                    ->whereKey($data['target_branch_id'])->where('company_id', $companyId)->exists(),
                422,
                'The selected branch does not belong to the target company.',
            );
        }

        if (! empty($data['target_department_id'])) {
            abort_unless(
                Department::withoutGlobalScope(CompanyScope::class)
                    ->whereKey($data['target_department_id'])->where('company_id', $companyId)->exists(),
                422,
                'The selected department does not belong to the target company.',
            );
        }

        $permissionIds = $data['permissions'] ?? [];
        unset($data['permissions']);

        $grant = CrossTenantGrant::create(array_merge($data, [
            'granted_by' => auth()->id(),
            'is_active' => true,
        ]));

        if (! empty($permissionIds)) {
            $grant->permissions()->sync($permissionIds);
        }

        $grant->load(['targetCompany:id,name', 'targetBranch:id,name', 'targetDepartment:id,name', 'grantedBy:id,name', 'permissions:id,name']);

        $this->audit->log(AuditLog::ACTION_CROSS_GRANT_CREATED, $grant->targetCompany, [
            'grantee_type' => $grant->grantee_type,
            'grantee_id' => $grant->grantee_id,
            'target_company_id' => $grant->target_company_id,
            'target_branch_id' => $grant->target_branch_id,
            'target_department_id' => $grant->target_department_id,
        ]);

        return response()->json(['data' => $this->format($grant)], Response::HTTP_CREATED);
    }

    public function destroy(CrossTenantGrant $grant): Response
    {
        $this->authorize('delete', $grant);

        $grant->update(['is_active' => false]);

        $this->audit->log(AuditLog::ACTION_CROSS_GRANT_REVOKED, $grant->targetCompany, [
            'grantee_type' => $grant->grantee_type,
            'grantee_id' => $grant->grantee_id,
            'target_company_id' => $grant->target_company_id,
        ]);

        return response()->noContent();
    }

    private function format(CrossTenantGrant $grant): array
    {
        return [
            'id' => $grant->id,
            'grantee_type' => $grant->grantee_type,
            'grantee_id' => $grant->grantee_id,
            'target_company' => $grant->targetCompany ? ['id' => $grant->targetCompany->id, 'name' => $grant->targetCompany->name] : null,
            'target_branch' => $grant->targetBranch ? ['id' => $grant->targetBranch->id, 'name' => $grant->targetBranch->name] : null,
            'target_department' => $grant->targetDepartment ? ['id' => $grant->targetDepartment->id, 'name' => $grant->targetDepartment->name] : null,
            'granted_by' => $grant->grantedBy ? ['id' => $grant->grantedBy->id, 'name' => $grant->grantedBy->name] : null,
            'permissions' => $grant->permissions->pluck('name'),
            'reason' => $grant->reason,
            'valid_until' => $grant->valid_until,
            'is_active' => $grant->is_active,
            'created_at' => $grant->created_at,
        ];
    }
}
