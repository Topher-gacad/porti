<?php

namespace App\Core\Workflow;

use App\Core\Tenancy\ConfigResolver;
use Illuminate\Database\Eloquent\Builder;

/**
 * Resolves which published, active WorkflowVersion applies to a record:
 * entity_type (+ slug) → company tier (specific-else-global) → active version.
 *
 * Keys off the RECORD's company via ConfigResolver (scope-OFF), never the acting user's
 * visibility. A company workflow with no active version transparently falls back to the
 * global default's active version. Returns null when nothing resolves → caller 422s.
 */
class WorkflowResolver
{
    public function __construct(private readonly ConfigResolver $configResolver) {}

    public function resolveVersion(string $entityType, string $slug, ?int $companyId): ?WorkflowVersion
    {
        /** @var Workflow|null $workflow */
        $workflow = $this->configResolver->resolve(
            Workflow::class,
            ['entity_type' => $entityType, 'slug' => $slug],
            $companyId,
            fn (Builder $q) => $q->whereHas('versions', fn (Builder $v) => $v->where('is_active', true)),
        );

        return $workflow?->activeVersion()->first();
    }

    public function resolveFor(HasWorkflow $record): ?WorkflowVersion
    {
        return $this->resolveVersion(
            $record->workflowEntityType(),
            $record->workflowSlug(),
            $record->workflowContext()['company_id'] ?? null,
        );
    }
}
