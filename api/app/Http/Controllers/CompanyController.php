<?php

namespace App\Http\Controllers;

use App\Http\Requests\Company\StoreCompanyRequest;
use App\Http\Requests\Company\UpdateCompanyRequest;
use App\Http\Resources\CompanyResource;
use App\Models\AuditLog;
use App\Models\Company;
use App\Services\AuditLogger;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class CompanyController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Company::class);

        $perPage = min((int) request()->integer('per_page', 20), 500);

        return CompanyResource::collection(Company::paginate($perPage));
    }

    public function store(StoreCompanyRequest $request): CompanyResource
    {
        $this->authorize('create', Company::class);

        $data = array_merge(['is_active' => true], $request->validated());

        return new CompanyResource(Company::create($data));
    }

    public function show(Company $company): CompanyResource
    {
        $this->authorize('view', $company);

        return new CompanyResource($company);
    }

    public function update(UpdateCompanyRequest $request, Company $company): CompanyResource
    {
        $this->authorize('update', $company);

        $before = $company->enforce_branch_isolation;

        $company->update($request->validated());

        // Log isolation setting changes explicitly for auditors
        $after = $company->fresh()->enforce_branch_isolation;
        if ($before !== $after) {
            $action = $after
                ? AuditLog::ACTION_BRANCH_ISOLATION_ON
                : AuditLog::ACTION_BRANCH_ISOLATION_OFF;
            $this->audit->log($action, $company);
        }

        return new CompanyResource($company);
    }

    public function destroy(Company $company): Response
    {
        $this->authorize('delete', $company);

        $company->delete();

        return response()->noContent();
    }
}
