<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBranchAccessGrantRequest;
use App\Models\AuditLog;
use App\Models\Branch;
use App\Models\BranchAccessGrant;
use App\Models\Company;
use App\Core\Tenancy\CompanyScope;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class BranchAccessGrantController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(Company $company): JsonResponse
    {
        $this->authorize('manageAccessGrants', $company);

        $grants = $company->branchAccessGrants()
            ->with(['branch:id,name', 'grantedBy:id,name'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($g) => $this->formatGrant($g));

        return response()->json(['data' => $grants]);
    }

    public function store(StoreBranchAccessGrantRequest $request, Company $company): JsonResponse
    {
        $this->authorize('manageAccessGrants', $company);

        $data = $request->validated();

        // The granted branch must belong to this company — exists:branches,id alone
        // would otherwise let a grant reference another tenant's branch.
        abort_unless(
            Branch::withoutGlobalScope(CompanyScope::class)
                ->whereKey($data['branch_id'])
                ->where('company_id', $company->id)
                ->exists(),
            422,
            'The selected branch does not belong to this company.',
        );

        $grant = $company->branchAccessGrants()->create(array_merge(
            $data,
            ['granted_by' => auth()->id()],
        ));

        $grant->load(['branch:id,name', 'grantedBy:id,name']);

        $this->audit->log(AuditLog::ACTION_BRANCH_GRANT_CREATED, $company, [
            'branch_id' => $grant->branch_id,
            'branch_name' => $grant->branch?->name,
            'grantee_type' => $grant->grantee_type,
            'grantee_id' => $grant->grantee_id,
        ]);

        return response()->json(['data' => $this->formatGrant($grant)], Response::HTTP_CREATED);
    }

    public function destroy(Company $company, BranchAccessGrant $grant): Response
    {
        $this->authorize('manageAccessGrants', $company);

        abort_unless((int) $grant->company_id === (int) $company->id, 404);

        $grant->update(['is_active' => false]);

        $this->audit->log(AuditLog::ACTION_BRANCH_GRANT_REVOKED, $company, [
            'branch_id' => $grant->branch_id,
            'grantee_type' => $grant->grantee_type,
            'grantee_id' => $grant->grantee_id,
        ]);

        return response()->noContent();
    }

    private function formatGrant(BranchAccessGrant $grant): array
    {
        return [
            'id' => $grant->id,
            'branch' => $grant->branch ? ['id' => $grant->branch->id, 'name' => $grant->branch->name] : null,
            'grantee_type' => $grant->grantee_type,
            'grantee_id' => $grant->grantee_id,
            'granted_by' => $grant->grantedBy ? ['id' => $grant->grantedBy->id, 'name' => $grant->grantedBy->name] : null,
            'reason' => $grant->reason,
            'valid_until' => $grant->valid_until,
            'is_active' => $grant->is_active,
            'created_at' => $grant->created_at,
        ];
    }
}
