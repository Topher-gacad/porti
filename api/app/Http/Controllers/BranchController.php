<?php

namespace App\Http\Controllers;

use App\Http\Requests\Branch\StoreBranchRequest;
use App\Http\Requests\Branch\UpdateBranchRequest;
use App\Http\Resources\BranchResource;
use App\Models\Branch;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class BranchController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Branch::class);

        return BranchResource::collection(Branch::paginate(20));
    }

    public function store(StoreBranchRequest $request): BranchResource
    {
        $this->authorize('create', Branch::class);

        $data = array_merge(['is_active' => true], $request->validated());

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

        $branch->update($request->validated());

        return new BranchResource($branch);
    }

    public function destroy(Branch $branch): Response
    {
        $this->authorize('delete', $branch);

        $branch->delete();

        return response()->noContent();
    }
}
