<?php

namespace App\Core\Workflow;

use App\Models\AuditLog;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\ScopedPermissionService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * Executes a record's lifecycle against its pinned, frozen WorkflowVersion. Entity-agnostic:
 * it reads the snapshot graph, never a hardcoded match().
 *
 * The transition gate (architecture §5):
 *   - integrity rules apply to everyone: requires_comment, prevent_self, the closed-registry
 *     condition (a record-state predicate, never eval'd);
 *   - the authz gate is ScopedPermissionService::can(actor, required_permission, context
 *     narrowed to scope_level) + optional allowed_role_names, with a super-admin/developer
 *     bypass (BasePolicy::before parity).
 *
 * Every transition writes BOTH the user-facing activity_events timeline and AuditLogger.
 * Approval is a gate, not a status: entering an is_approval_gate state opens a pending
 * WorkflowApproval row; leaving it resolves that row.
 */
class WorkflowEngine
{
    public function __construct(
        private readonly WorkflowResolver $resolver,
        private readonly ConditionRegistry $conditions,
        private readonly ScopedPermissionService $permissions,
        private readonly AuditLogger $audit,
    ) {}

    /**
     * Resolve the active workflow for the record, pin its version, and place the record in
     * the initial state. Throws (422) rather than silently leaving a record stateless.
     */
    public function start(Model&HasWorkflow $record, ?User $actor = null): void
    {
        $version = $this->resolver->resolveFor($record);
        abort_if($version === null, 422, "No active workflow for [{$record->workflowEntityType()}/{$record->workflowSlug()}].");

        $graph = WorkflowGraph::fromVersion($version);
        $initial = $graph->initialState();
        abort_if($initial === null, 422, 'Resolved workflow has no initial state.');

        $actor ??= auth()->user();

        DB::transaction(function () use ($record, $version, $initial, $actor) {
            $record->workflow_version_id = $version->id;
            $this->enterState($record, $initial);

            $this->recordActivity($record, ActivityEvent::VERB_STARTED, $actor, [
                'state' => $initial['slug'],
                'category' => $initial['category'],
            ]);
            $this->audit->log(AuditLog::ACTION_WORKFLOW_STARTED, $record, [
                'state' => $initial['slug'],
                'workflow_version_id' => $version->id,
            ]);
        });
    }

    /**
     * The transitions leaving the record's current state that the actor may take right now.
     *
     * @return list<array>
     */
    public function availableTransitions(Model&HasWorkflow $record, ?User $actor): array
    {
        $graph = $this->graphFor($record);

        return array_values(array_filter(
            $graph->transitionsFrom((string) $record->workflow_state),
            fn (array $t) => $this->gateFailure($t, $record, $actor, null) === null,
        ));
    }

    /**
     * Apply a transition by slug. Validates the full gate, moves the record, resolves any
     * approval gate, and writes the activity + audit trail. Throws 403 (gate) or 422
     * (invalid transition / missing comment).
     */
    public function apply(Model&HasWorkflow $record, string $transitionSlug, ?User $actor, ?string $comment = null): void
    {
        $graph = $this->graphFor($record);

        $transition = $graph->transition($transitionSlug);
        abort_if($transition === null, 422, "Unknown transition [{$transitionSlug}].");
        abort_if(
            ($transition['from'] ?? null) !== $record->workflow_state,
            422,
            "Transition [{$transitionSlug}] is not available from the current state.",
        );

        if (! empty($transition['requires_comment']) && ($comment === null || trim($comment) === '')) {
            abort(422, "Transition [{$transitionSlug}] requires a comment.");
        }

        if ($reason = $this->gateFailure($transition, $record, $actor, $comment)) {
            abort(403, $reason);
        }

        $fromState = $graph->state((string) $record->workflow_state);
        $toState = $graph->state((string) $transition['to']);
        abort_if($toState === null, 422, 'Transition target state is missing from the snapshot.');

        $from = (string) $record->workflow_state;

        DB::transaction(function () use ($record, $transition, $fromState, $toState, $from, $actor, $comment) {
            $this->resolvePendingApproval($record, $fromState, $toState, $actor, $comment);

            $this->enterState($record, $toState);

            $this->recordActivity($record, ActivityEvent::VERB_TRANSITIONED, $actor, [
                'transition' => $transition['slug'],
                'from' => $from,
                'to' => $toState['slug'],
                'category' => $toState['category'],
                'comment' => $comment,
            ]);
            $this->audit->log(AuditLog::ACTION_WORKFLOW_TRANSITIONED, $record, [
                'transition' => $transition['slug'],
                'from' => $from,
                'to' => $toState['slug'],
            ]);
        });
    }

    /**
     * @return string|null a failure reason, or null when the gate passes
     */
    private function gateFailure(array $transition, Model&HasWorkflow $record, ?User $actor, ?string $comment): ?string
    {
        // Integrity rules — apply to everyone, including privileged actors.
        if (! empty($transition['prevent_self'])) {
            $ownerId = $this->recordOwnerId($record);
            if ($actor !== null && $ownerId !== null && (int) $actor->id === $ownerId) {
                return "You cannot perform [{$transition['slug']}] on your own record.";
            }
        }

        if (! empty($transition['condition'])
            && ! $this->conditions->evaluate($transition['condition'], $record, $actor)) {
            return "Transition [{$transition['slug']}] is not permitted for this record.";
        }

        // Authz gate — bypassed by super-admin/developer (BasePolicy::before parity).
        $privileged = $actor !== null && $actor->hasAnyRole(['super-admin', 'developer']);
        if ($privileged) {
            return null;
        }

        if (! empty($transition['required_permission'])) {
            $context = $this->narrowContext($record->workflowContext(), $transition['scope_level'] ?? null);
            if ($actor === null || ! $this->permissions->can($actor, $transition['required_permission'], $context)) {
                return "You do not have permission to perform [{$transition['slug']}].";
            }
        }

        if (! empty($transition['allowed_role_names'])) {
            $hasRole = $actor !== null
                && collect($transition['allowed_role_names'])->contains(fn ($r) => $actor->hasRole($r));
            if (! $hasRole) {
                return "Your role may not perform [{$transition['slug']}].";
            }
        }

        return null;
    }

    /**
     * Narrow the record's tenancy context to the keys the transition's scope_level gates on.
     * A null scope_level checks against the record's full context.
     *
     * @param  array{company_id: int|null, branch_id: int|null, department_id: int|null}  $context
     * @return array<string, int|null>
     */
    private function narrowContext(array $context, ?string $scopeLevel): array
    {
        return match ($scopeLevel) {
            'department' => ['department_id' => $context['department_id'] ?? null],
            'branch' => ['branch_id' => $context['branch_id'] ?? null],
            'company' => ['company_id' => $context['company_id'] ?? null],
            'global' => [],
            default => array_filter([
                'company_id' => $context['company_id'] ?? null,
                'branch_id' => $context['branch_id'] ?? null,
                'department_id' => $context['department_id'] ?? null,
            ], fn ($v) => $v !== null),
        };
    }

    private function enterState(Model&HasWorkflow $record, array $state): void
    {
        $record->workflow_state = $state['slug'];
        $record->state_category = $state['category'];
        $record->save();

        if (! empty($state['is_approval_gate'])) {
            WorkflowApproval::create([
                'approvable_type' => $record->getMorphClass(),
                'approvable_id' => $record->getKey(),
                'state_slug' => $state['slug'],
                'status' => WorkflowApproval::STATUS_PENDING,
            ]);
        }
    }

    /**
     * When leaving an approval-gate state, resolve its pending approval. A transition into a
     * 'cancelled'-category state is a rejection; anything else is an approval.
     */
    private function resolvePendingApproval(Model&HasWorkflow $record, ?array $fromState, array $toState, ?User $actor, ?string $comment): void
    {
        if (empty($fromState['is_approval_gate'])) {
            return;
        }

        $pending = WorkflowApproval::where('approvable_type', $record->getMorphClass())
            ->where('approvable_id', $record->getKey())
            ->where('state_slug', $fromState['slug'])
            ->where('status', WorkflowApproval::STATUS_PENDING)
            ->latest('id')
            ->first();

        if ($pending === null) {
            return;
        }

        $rejected = ($toState['category'] ?? null) === 'cancelled';

        $pending->update([
            'status' => $rejected ? WorkflowApproval::STATUS_REJECTED : WorkflowApproval::STATUS_APPROVED,
            'decided_by' => $actor?->id,
            'decided_at' => now(),
            'comment' => $comment,
        ]);
    }

    private function recordActivity(Model&HasWorkflow $record, string $verb, ?User $actor, array $properties): void
    {
        ActivityEvent::create([
            'subject_type' => $record->getMorphClass(),
            'subject_id' => $record->getKey(),
            'actor_id' => $actor?->id,
            'verb' => $verb,
            'properties' => $properties,
            'created_at' => now(),
        ]);
    }

    private function recordOwnerId(Model&HasWorkflow $record): ?int
    {
        foreach (['requester_id', 'user_id', 'created_by'] as $column) {
            if ($record->getAttribute($column) !== null) {
                return (int) $record->getAttribute($column);
            }
        }

        return null;
    }

    private function graphFor(Model&HasWorkflow $record): WorkflowGraph
    {
        abort_if($record->workflow_version_id === null, 422, 'Record has not been started on a workflow.');

        $version = WorkflowVersion::find($record->workflow_version_id);
        abort_if($version === null, 422, 'Pinned workflow version no longer exists.');

        return WorkflowGraph::fromVersion($version);
    }
}
