<?php

namespace App\Http\Controllers;

use App\Http\Requests\Branch\StoreBranchRequest;
use App\Http\Requests\Branch\UpdateBranchRequest;
use App\Http\Resources\BranchResource;
use App\Models\Branch;
use App\Services\TenantAccess;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class BranchController extends Controller
{
    public function __construct(private readonly TenantAccess $tenant) {}

    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Branch::class);

        $perPage = min((int) request()->integer('per_page', 20), 500);

        return BranchResource::collection(Branch::paginate($perPage));
    }

    public function store(StoreBranchRequest $request): BranchResource
    {
        $this->authorize('create', Branch::class);

        $data = array_merge(['is_active' => true], $request->validated());

        $this->tenant->assertTenantAssignment(auth()->user(), $data);

        return new BranchResource(Branch::create($data));
    }

    public function show(Branch $branch): BranchResource
    {
        $this->authorize('view', $branch);

        return new BranchResource($branch);
    }

    public function update(UpdateBranchRequest $request, Branch $branch): BranchResource
    {
        $this->authorize('update', $branch);

        $data = $request->validated();

        // No-op today (company_id is not an updatable field), but keeps the guard
        // in place if a tenant FK is ever added to UpdateBranchRequest.
        $this->tenant->assertTenantAssignment(auth()->user(), $data, $branch);

        $branch->update($data);

        return new BranchResource($branch);
    }

    public function destroy(Branch $branch): Response
    {
        $this->authorize('delete', $branch);

        $branch->delete();

        return response()->noContent();
    }
}
