<?php

namespace App\Core\Workflow;

use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * The draft → publish → snapshot → activate lifecycle.
 *
 * publish() validates the editable workflow and freezes its graph into a new immutable
 * WorkflowVersion. activate() flips which version is live, enforcing one-active-version per
 * workflow inside a transaction (deactivate the prior, activate the new) — NOT a DB partial
 * index (not portable to the in-memory SQLite test DB). Every step writes a ConfigRevision.
 */
class WorkflowPublisher
{
    public function __construct(private readonly WorkflowValidator $validator) {}

    /**
     * @throws WorkflowValidationException
     */
    public function publish(Workflow $workflow, ?User $actor = null): WorkflowVersion
    {
        $workflow->loadMissing('states', 'transitions');

        $errors = $this->validator->validate($workflow);
        if ($errors !== []) {
            throw new WorkflowValidationException($errors);
        }

        return DB::transaction(function () use ($workflow, $actor) {
            $next = ((int) $workflow->versions()->max('version')) + 1;

            $version = $workflow->versions()->create([
                'version' => $next,
                'graph_snapshot' => $this->snapshot($workflow),
                'is_active' => false,
                'published_at' => now(),
                'published_by' => $actor?->id,
            ]);

            $this->revision($workflow, ConfigRevision::ACTION_PUBLISHED, $next, $actor);

            return $version;
        });
    }

    public function activate(WorkflowVersion $version, ?User $actor = null): void
    {
        DB::transaction(function () use ($version, $actor) {
            $workflow = $version->workflow;

            $workflow->versions()
                ->where('is_active', true)
                ->where('id', '!=', $version->id)
                ->get()
                ->each(function (WorkflowVersion $prior) use ($workflow, $actor) {
                    $prior->update(['is_active' => false]);
                    $this->revision($workflow, ConfigRevision::ACTION_DEACTIVATED, $prior->version, $actor);
                });

            $version->update(['is_active' => true]);
            $this->revision($workflow, ConfigRevision::ACTION_ACTIVATED, $version->version, $actor);
        });
    }

    public function publishAndActivate(Workflow $workflow, ?User $actor = null): WorkflowVersion
    {
        $version = $this->publish($workflow, $actor);
        $this->activate($version, $actor);

        return $version;
    }

    /**
     * Freeze states + transitions keyed by stable slugs (not ids) so the snapshot is
     * self-contained and survives later edits to the editable workflow.
     *
     * @return array{states: list<array>, transitions: list<array>}
     */
    private function snapshot(Workflow $workflow): array
    {
        $slugById = $workflow->states->keyBy('id');

        $states = $workflow->states->map(fn (WorkflowState $s) => [
            'slug' => $s->slug,
            'name' => $s->name,
            'category' => $s->category,
            'is_initial' => $s->is_initial,
            'is_terminal' => $s->is_terminal,
            'sla_pauses' => $s->sla_pauses,
            'is_approval_gate' => $s->is_approval_gate,
        ])->values()->all();

        $transitions = $workflow->transitions->map(fn (WorkflowTransition $t) => [
            'slug' => $t->slug,
            'name' => $t->name,
            'from' => $slugById[$t->from_state_id]->slug ?? null,
            'to' => $slugById[$t->to_state_id]->slug ?? null,
            'required_permission' => $t->required_permission,
            'scope_level' => $t->scope_level,
            'allowed_role_names' => $t->allowed_role_names,
            'prevent_self' => $t->prevent_self,
            'requires_comment' => $t->requires_comment,
            'condition' => $t->condition,
        ])->values()->all();

        return ['states' => $states, 'transitions' => $transitions];
    }

    private function revision(Workflow $workflow, string $action, int $version, ?User $actor): void
    {
        ConfigRevision::create([
            'configurable_type' => $workflow->getMorphClass(),
            'configurable_id' => $workflow->getKey(),
            'action' => $action,
            'version' => $version,
            'actor_id' => $actor?->id,
            'created_at' => now(),
        ]);
    }
}
