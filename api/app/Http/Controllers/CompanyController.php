<?php

namespace App\Http\Controllers;

use App\Http\Requests\Company\StoreCompanyRequest;
use App\Http\Requests\Company\UpdateCompanyRequest;
use App\Http\Resources\CompanyResource;
use App\Models\Company;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class CompanyController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Company::class);

        return CompanyResource::collection(Company::paginate(20));
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

        $company->update($request->validated());

        return new CompanyResource($company);
    }

    public function destroy(Company $company): Response
    {
        $this->authorize('delete', $company);

        $company->delete();

        return response()->noContent();
    }
}
