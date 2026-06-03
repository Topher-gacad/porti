<?php

namespace App\Core\Workflow;

/**
 * Validates a workflow definition is coherent and publishable, enforcing the invariants the
 * engine relies on: exactly one initial state, at least one terminal state, every state's
 * category within the entity_type spine, transitions referencing only this workflow's states,
 * valid scope levels, and conditions that exist in the closed ConditionRegistry.
 */
class WorkflowValidator
{
    public function __construct(private readonly ConditionRegistry $conditions) {}

    public function passes(Workflow $workflow): bool
    {
        return $this->validate($workflow) === [];
    }

    /**
     * @return list<string> human-readable errors (empty = valid)
     */
    public function validate(Workflow $workflow): array
    {
        $errors = [];
        $states = $workflow->states;
        $transitions = $workflow->transitions;

        if ($states->isEmpty()) {
            return ['A workflow must define at least one state.'];
        }

        if ($states->where('is_initial', true)->count() !== 1) {
            $errors[] = 'A workflow must have exactly one initial state.';
        }

        if ($states->where('is_terminal', true)->isEmpty()) {
            $errors[] = 'A workflow must have at least one terminal state.';
        }

        if (! CategoryRegistry::has($workflow->entity_type)) {
            $errors[] = "No category spine is registered for entity_type [{$workflow->entity_type}].";
        } else {
            foreach ($states as $state) {
                if (! CategoryRegistry::isValid($workflow->entity_type, $state->category)) {
                    $errors[] = "State [{$state->slug}] has category [{$state->category}] outside the [{$workflow->entity_type}] spine.";
                }
            }
        }

        $stateIds = $states->pluck('id')->all();

        foreach ($transitions as $transition) {
            if (! in_array($transition->from_state_id, $stateIds, true)) {
                $errors[] = "Transition [{$transition->slug}] references a from_state outside this workflow.";
            }

            if (! in_array($transition->to_state_id, $stateIds, true)) {
                $errors[] = "Transition [{$transition->slug}] references a to_state outside this workflow.";
            }

            if ($transition->scope_level !== null
                && ! in_array($transition->scope_level, WorkflowTransition::SCOPE_LEVELS, true)) {
                $errors[] = "Transition [{$transition->slug}] has an invalid scope_level [{$transition->scope_level}].";
            }

            if ($transition->condition !== null && ! $this->conditions->has($transition->condition)) {
                $errors[] = "Transition [{$transition->slug}] references unknown condition [{$transition->condition}].";
            }
        }

        return $errors;
    }
}
