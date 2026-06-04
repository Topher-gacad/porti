<?php

namespace App\Core\Workflow;

use RuntimeException;

/**
 * Thrown when a workflow fails validation at publish time. Carries the human-readable
 * errors so a controller (Phase 4 Administration) can surface them as a 422.
 */
class WorkflowValidationException extends RuntimeException
{
    /**
     * @param  list<string>  $errors
     */
    public function __construct(public readonly array $errors)
    {
        parent::__construct('Workflow is not valid: '.implode(' ', $errors));
    }
}
