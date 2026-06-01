<?php

namespace App\Http\Controllers;

use App\Http\Requests\Team\StoreTeamRequest;
use App\Http\Requests\Team\UpdateTeamRequest;
use App\Http\Resources\TeamResource;
use App\Models\Team;
use App\Services\TenantAccess;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class TeamController extends Controller
{
    public function __construct(private readonly TenantAccess $tenant) {}

    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Team::class);

        return TeamResource::collection(Team::paginate(20));
    }

    public function store(StoreTeamRequest $request): TeamResource
    {
        $this->authorize('create', Team::class);

        $data = array_merge(['is_active' => true], $request->validated());

        $this->tenant->assertTenantAssignment(auth()->user(), $data);

        return new TeamResource(Team::create($data));
    }

    public function show(Team $team): TeamResource
    {
        $this->authorize('view', $team);

        return new TeamResource($team);
    }

    public function update(UpdateTeamRequest $request, Team $team): TeamResource
    {
        $this->authorize('update', $team);

        $data = $request->validated();

        // No-op today (company_id is not an updatable field), but keeps the guard
        // in place if a tenant FK is ever added to UpdateTeamRequest.
        $this->tenant->assertTenantAssignment(auth()->user(), $data, $team);

        $team->update($data);

        return new TeamResource($team);
    }

    public function destroy(Team $team): Response
    {
        $this->authorize('delete', $team);

        $team->delete();

        return response()->noContent();
    }
}
