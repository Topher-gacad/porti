<?php

namespace App\Modules\Submissions;

use App\Core\Shared\Sequence;
use App\Core\Workflow\WorkflowEngine;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Creates submissions: resolve the form for the company tier, validate the payload against
 * its schema, snapshot the form version, assign a per-company-per-form number, persist, and
 * start the bound workflow. The whole flow is config-driven — no per-type code.
 */
class SubmissionService
{
    public function __construct(
        private readonly FormResolver $forms,
        private readonly SchemaValidator $schema,
        private readonly Sequence $sequence,
        private readonly WorkflowEngine $engine,
    ) {}

    /**
     * @param  array<string, mixed>  $data  the form payload
     * @param  array{company_id?: int, branch_id?: int, department_id?: int, assignee_id?: int, assigned_team_id?: int}  $options
     */
    public function create(string $formKey, array $data, User $requester, array $options = []): Submission
    {
        $companyId = $options['company_id'] ?? $requester->company_id;
        abort_if($companyId === null, 422, 'A submission requires a company.');

        $form = $this->forms->resolve($formKey, $companyId);
        abort_if($form === null, 422, "No published form [{$formKey}] is available for this company.");

        // Typed validation against the snapshotted schema (throws 422 ValidationException).
        $validated = $this->schema->validate($form->field_schema, $data);

        return DB::transaction(function () use ($form, $companyId, $requester, $validated, $options) {
            $seq = $this->sequence->next("submission:{$companyId}:{$form->key}");

            $submission = Submission::create([
                'company_id' => $companyId,
                'branch_id' => $options['branch_id'] ?? $requester->branch_id,
                'department_id' => $options['department_id'] ?? $requester->department_id,
                'form_definition_id' => $form->id,
                'form_definition_version' => $form->version,
                'entity_type' => 'submission',
                'workflow_key' => $form->workflow_key,
                'number' => $this->number($form, $seq),
                'requester_id' => $requester->id,
                'assignee_id' => $options['assignee_id'] ?? null,
                'assigned_team_id' => $options['assigned_team_id'] ?? null,
                'data' => $validated,
            ]);

            // Resolve + pin the bound workflow (entity_type 'submission' + form's workflow_key)
            // and place the record in its initial state.
            $this->engine->start($submission, $requester);

            return $submission;
        });
    }

    private function number(FormDefinition $form, int $seq): string
    {
        $prefix = $form->naming_series ?: strtoupper($form->key).'-';

        return $prefix.str_pad((string) $seq, 4, '0', STR_PAD_LEFT);
    }
}
