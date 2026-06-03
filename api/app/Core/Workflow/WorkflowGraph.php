<?php

namespace App\Core\Workflow;

/**
 * Read-only view over a frozen graph_snapshot (states + transitions keyed by stable slugs).
 * The engine runs entirely off this — a record pinned to a version finishes on that frozen
 * graph even after the editable workflow changes.
 */
class WorkflowGraph
{
    /**
     * @param  array{states?: list<array>, transitions?: list<array>}  $snapshot
     */
    public function __construct(private readonly array $snapshot) {}

    public static function fromVersion(WorkflowVersion $version): self
    {
        return new self($version->graph_snapshot ?? []);
    }

    /**
     * @return list<array>
     */
    public function states(): array
    {
        return $this->snapshot['states'] ?? [];
    }

    /**
     * @return list<array>
     */
    public function transitions(): array
    {
        return $this->snapshot['transitions'] ?? [];
    }

    public function initialState(): ?array
    {
        foreach ($this->states() as $state) {
            if (! empty($state['is_initial'])) {
                return $state;
            }
        }

        return null;
    }

    public function state(string $slug): ?array
    {
        foreach ($this->states() as $state) {
            if (($state['slug'] ?? null) === $slug) {
                return $state;
            }
        }

        return null;
    }

    /**
     * The transitions leaving a given state slug.
     *
     * @return list<array>
     */
    public function transitionsFrom(string $stateSlug): array
    {
        return array_values(array_filter(
            $this->transitions(),
            fn ($t) => ($t['from'] ?? null) === $stateSlug,
        ));
    }

    public function transition(string $slug): ?array
    {
        foreach ($this->transitions() as $transition) {
            if (($transition['slug'] ?? null) === $slug) {
                return $transition;
            }
        }

        return null;
    }
}
