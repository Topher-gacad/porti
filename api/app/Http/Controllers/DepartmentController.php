<?php

namespace App\Http\Controllers;

use App\Http\Requests\Department\StoreDepartmentRequest;
use App\Http\Requests\Department\UpdateDepartmentRequest;
use App\Http\Resources\DepartmentResource;
use App\Models\Department;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class DepartmentController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Department::class);

        return DepartmentResource::collection(Department::paginate(20));
    }

    public function store(StoreDepartmentRequest $request): DepartmentResource
    {
        $this->authorize('create', Department::class);

        $data = array_merge(['is_active' => true], $request->validated());

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

        $department->update($request->validated());

        return new DepartmentResource($department);
    }

    public function destroy(Department $department): Response
    {
        $this->authorize('delete', $department);

        $department->delete();

        return response()->noContent();
    }
}
