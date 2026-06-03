<?php

namespace App\Http\Controllers;

use App\Core\Workflow\WorkflowEngine;
use App\Modules\Submissions\Submission;
use App\Modules\Submissions\SubmissionService;
use App\Services\ScopedPermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * The end-user submission runtime: file a request, see mine / my approval inbox, view one
 * with its timeline, and act on it through the workflow engine. Tenancy is automatic
 * (CompanyScope on Submission); per-action authority is the engine's transition gate.
 */
class SubmissionController extends Controller
{
    public function __construct(
        private readonly SubmissionService $submissions,
        private readonly WorkflowEngine $engine,
        private readonly ScopedPermissionService $permissions,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Submission::class);

        $user = $request->user();
        $scope = $request->string('scope', 'mine')->toString();
        $perPage = min((int) $request->integer('per_page', 20), 200);

        $query = Submission::query()->with('formDefinition:id,key,name')->latest();

        if ($scope === 'inbox') {
            // Submissions awaiting a decision the actor is allowed to make (not their own).
            abort_unless(
                $this->permissions->can($user, 'submissions.approve', ['company_id' => $user->company_id]),
                Response::HTTP_FORBIDDEN,
                'You cannot approve submissions.',
            );
            $query->where('state_category', 'in_progress')->where('requester_id', '!=', $user->id);
        } else {
            $query->where('requester_id', $user->id);
        }

        return response()->json(
            $query->paginate($perPage)->through(fn (Submission $s) => $this->summary($s))
        );
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Submission::class);

        $data = $request->validate([
            'form_key' => ['required', 'string'],
            'data' => ['array'],
        ]);

        // SubmissionService validates the payload against the form schema (422 on failure),
        // numbers it, and starts the bound workflow.
        $submission = $this->submissions->create(
            $data['form_key'],
            $data['data'] ?? [],
            $request->user(),
        );

        return response()->json(['data' => $this->detail($submission, $request->user())], Response::HTTP_CREATED);
    }

    public function show(Request $request, Submission $submission): JsonResponse
    {
        $this->authorize('view', $submission);

        return response()->json(['data' => $this->detail($submission, $request->user())]);
    }

    public function transitions(Request $request, Submission $submission): JsonResponse
    {
        $this->authorize('view', $submission);

        return response()->json(['data' => $this->availableTransitions($submission, $request->user())]);
    }

    public function applyTransition(Request $request, Submission $submission, string $slug): JsonResponse
    {
        $this->authorize('view', $submission);

        $comment = $request->string('comment')->toString() ?: null;

        // The engine enforces the full gate (permission/scope/role/condition/prevent_self/
        // requires_comment) and aborts 403/422 on failure.
        $this->engine->apply($submission, $slug, $request->user(), $comment);

        return response()->json(['data' => $this->detail($submission->fresh(), $request->user())]);
    }

    private function summary(Submission $s): array
    {
        return [
            'id' => $s->id,
            'number' => $s->number,
            'form_key' => $s->formDefinition?->key ?? $s->workflow_key,
            'form_name' => $s->formDefinition?->name,
            'state' => $s->workflow_state,
            'state_category' => $s->state_category,
            'requester_id' => $s->requester_id,
            'created_at' => $s->created_at,
        ];
    }

    private function detail(Submission $s, $actor): array
    {
        $s->loadMissing(['formDefinition:id,key,name', 'requester:id,name', 'assignee:id,name']);

        $timeline = $s->activityEvents()
            ->with('actor:id,name')
            ->orderBy('id')
            ->get()
            ->map(fn ($e) => [
                'verb' => $e->verb,
                'properties' => $e->properties,
                'actor' => $e->actor ? ['id' => $e->actor->id, 'name' => $e->actor->name] : null,
                'created_at' => $e->created_at,
            ]);

        $pending = $s->pendingApproval();

        return array_merge($this->summary($s), [
            'data' => $s->data,
            'requester' => $s->requester ? ['id' => $s->requester->id, 'name' => $s->requester->name] : null,
            'assignee' => $s->assignee ? ['id' => $s->assignee->id, 'name' => $s->assignee->name] : null,
            'pending_approval' => $pending ? ['state_slug' => $pending->state_slug, 'status' => $pending->status] : null,
            'available_transitions' => $this->availableTransitions($s, $actor),
            'timeline' => $timeline,
        ]);
    }

    /**
     * @return list<array{slug: string, name: string}>
     */
    private function availableTransitions(Submission $s, $actor): array
    {
        return array_map(
            fn (array $t) => ['slug' => $t['slug'], 'name' => $t['name']],
            $this->engine->availableTransitions($s, $actor),
        );
    }
}
