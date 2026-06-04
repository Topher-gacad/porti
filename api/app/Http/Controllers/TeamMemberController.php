<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\Team;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\TenantAccess;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class TeamMemberController extends Controller
{
    public function __construct(private readonly TenantAccess $tenant) {}

    public function index(Team $team): AnonymousResourceCollection
    {
        $this->authorize('view', $team);

        return UserResource::collection($team->members()->orderBy('name')->get());
    }

    public function store(Request $request, Team $team): JsonResponse
    {
        $this->authorize('update', $team);

        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $user = User::findOrFail($data['user_id']);

        // A team's members must belong to the team's company. The User lookup above is
        // already CompanyScope-filtered, but assert explicitly so membership integrity
        // does not depend on the global scope alone (privileged actors excepted).
        if (! $this->tenant->isPrivileged($request->user())) {
            abort_unless(
                (int) $user->company_id === (int) $team->company_id,
                403,
                'User does not belong to this team\'s company.',
            );
        }

        if ($team->members()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'User is already a member of this team.'], 409);
        }

        $team->members()->attach($user->id);

        app(AuditLogger::class)->log(AuditLog::ACTION_MEMBER_ADDED, $team, [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'team_name' => $team->name,
        ]);

        return response()->json(['data' => new UserResource($user)], 201);
    }

    public function destroy(Team $team, User $user): Response
    {
        $this->authorize('update', $team);

        $team->members()->detach($user->id);

        app(AuditLogger::class)->log(AuditLog::ACTION_MEMBER_REMOVED, $team, [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'team_name' => $team->name,
        ]);

        return response()->noContent();
    }
}
