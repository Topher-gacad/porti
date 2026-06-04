<?php

namespace App\Core\Workflow;

/**
 * Implemented by any record that gets a configurable lifecycle. The engine reads these to
 * resolve which workflow applies and to narrow transition gates to the record's context.
 *
 * The companion TracksWorkflow trait supplies a default workflowContext() plus the
 * polymorphic activityEvents()/workflowApprovals() relations. The record table must carry
 * `workflow_state` (slug), `state_category`, and `workflow_version_id` columns.
 */
interface HasWorkflow
{
    /** The logical record type used to find the workflow + its CategoryRegistry spine. */
    public function workflowEntityType(): string;

    /** The workflow_key (slug) within the entity_type. */
    public function workflowSlug(): string;

    /**
     * The record's tenancy context, used to narrow transition scope gates.
     *
     * @return array{company_id: int|null, branch_id: int|null, department_id: int|null}
     */
    public function workflowContext(): array;
}
