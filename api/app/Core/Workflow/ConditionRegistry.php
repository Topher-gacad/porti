<?php

namespace App\Core\Workflow;

use App\Models\User;
use InvalidArgumentException;

/**
 * The CLOSED guard registry for transition conditions. A transition's `condition` is a KEY
 * into this registry — never an expression that is eval'd. Guards are code-reviewed PHP
 * closures; modules register their own at boot (this is a container singleton).
 *
 * Bound as a singleton so module-registered guards accumulate into one instance the engine
 * and validator share. Each test gets a fresh application/container, so registrations do
 * not bleed across tests.
 */
class ConditionRegistry
{
    /** @var array<string, callable(HasWorkflow, User|null): bool> */
    private array $conditions = [];

    public function __construct()
    {
        // Built-in guard. Modules add domain guards (e.g. amount thresholds) via register().
        $this->register('always', fn (HasWorkflow $record, ?User $actor) => true);
    }

    /**
     * @param  callable(HasWorkflow, User|null): bool  $guard
     */
    public function register(string $key, callable $guard): void
    {
        $this->conditions[$key] = $guard;
    }

    public function has(string $key): bool
    {
        return isset($this->conditions[$key]);
    }

    /**
     * @return list<string>
     */
    public function keys(): array
    {
        return array_keys($this->conditions);
    }

    public function evaluate(string $key, HasWorkflow $record, ?User $actor): bool
    {
        if (! $this->has($key)) {
            throw new InvalidArgumentException(
                "Unknown workflow condition [{$key}]. Conditions must be registered in the closed ConditionRegistry, never eval'd."
            );
        }

        return (bool) ($this->conditions[$key])($record, $actor);
    }
}
