<?php

namespace App\Http\Controllers;

use App\Http\Requests\Department\StoreDepartmentRequest;
use App\Http\Requests\Department\UpdateDepartmentRequest;
use App\Http\Resources\DepartmentResource;
use App\Models\Department;
use App\Services\TenantAccess;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class DepartmentController extends Controller
{
    public function __construct(private readonly TenantAccess $tenant) {}

    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Department::class);

        $perPage = min((int) request()->integer('per_page', 20), 500);

        return DepartmentResource::collection(Department::paginate($perPage));
    }

    public function store(StoreDepartmentRequest $request): DepartmentResource
    {
        $this->authorize('create', Department::class);

        $data = array_merge(['is_active' => true], $request->validated());

        $this->tenant->assertTenantAssignment(auth()->user(), $data);

        return new DepartmentResource(Department::create($data));
    }

    public function show(Department $department): DepartmentResource
    {
        $this->authorize('view', $department);

        return new DepartmentResource($department);
    }

    public function update(UpdateDepartmentRequest $request, Department $department): DepartmentResource
    {
        $this->authorize('update', $department);

        $data = $request->validated();

        // Reject reparenting the department under a branch from another company.
        $this->tenant->assertTenantAssignment(auth()->user(), $data, $department);

        $department->update($data);

        return new DepartmentResource($department);
    }

    public function destroy(Department $department): Response
    {
        $this->authorize('delete', $department);

        $department->delete();

        return response()->noContent();
    }
}
