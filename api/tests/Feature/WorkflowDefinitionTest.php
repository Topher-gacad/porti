<?php

namespace Tests\Feature;

use App\Core\Tenancy\ConfigVisibilityScope;
use App\Core\Workflow\CategoryRegistry;
use App\Core\Workflow\ConditionRegistry;
use App\Core\Workflow\HasWorkflow;
use App\Core\Workflow\Workflow;
use App\Core\Workflow\WorkflowValidator;
use App\Models\Company;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;
use Tests\TestCase;

/**
 * Phase 2a: the workflow data spine + the two closed registries (fixed category spine,
 * closed condition guards) + the publish-time validator.
 */
class WorkflowDefinitionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    private function workflow(string $entityType = 'submission', ?int $companyId = null): Workflow
    {
        return Workflow::withoutGlobalScope(ConfigVisibilityScope::class)->create([
            'company_id' => $companyId,
            'entity_type' => $entityType,
            'slug' => 'default',
            'name' => 'Default',
        ]);
    }

    /** A valid 3-state submission workflow: draft → review (gate) → done. */
    private function buildValid(Workflow $wf): Workflow
    {
        $draft = $wf->states()->create(['name' => 'Draft', 'slug' => 'draft', 'category' => 'open', 'is_initial' => true]);
        $review = $wf->states()->create(['name' => 'In Review', 'slug' => 'review', 'category' => 'in_progress', 'is_approval_gate' => true]);
        $done = $wf->states()->create(['name' => 'Done', 'slug' => 'done', 'category' => 'closed', 'is_terminal' => true]);

        $wf->transitions()->create(['from_state_id' => $draft->id, 'to_state_id' => $review->id, 'name' => 'Submit', 'slug' => 'submit']);
        $wf->transitions()->create([
            'from_state_id' => $review->id, 'to_state_id' => $done->id, 'name' => 'Approve', 'slug' => 'approve',
            'required_permission' => 'submissions.approve', 'scope_level' => 'company',
        ]);

        return $wf->fresh(['states', 'transitions']);
    }

    // ── SharedConfig on the owning workflow row ─────────────────────────────────

    public function test_workflow_is_shared_config(): void
    {
        $c = Company::create(['name' => 'Acme', 'code' => 'ACM', 'is_active' => true]);
        $this->workflow('submission', null);
        $this->workflow('submission', $c->id);

        $this->assertCount(1, Workflow::globalDefaults()->get());
        $this->assertCount(1, Workflow::forCompanyConfig($c->id)->get());
        $this->assertTrue(Workflow::globalDefaults()->first()->isGlobalDefault());
    }

    public function test_relations_and_initial_state(): void
    {
        $wf = $this->buildValid($this->workflow());

        $this->assertCount(3, $wf->states);
        $this->assertCount(2, $wf->transitions);
        $this->assertSame('draft', $wf->initialState()->slug);
    }

    // ── CategoryRegistry (fixed spine) ──────────────────────────────────────────

    public function test_category_registry_validates_against_the_spine(): void
    {
        $this->assertTrue(CategoryRegistry::has('submission'));
        $this->assertTrue(CategoryRegistry::isValid('submission', 'in_progress'));
        $this->assertFalse(CategoryRegistry::isValid('submission', 'bogus'));
        $this->assertFalse(CategoryRegistry::isValid('ticket', 'closed')); // not in the ticket spine

        $this->expectException(InvalidArgumentException::class);
        CategoryRegistry::for('not-an-entity');
    }

    // ── ConditionRegistry (closed guards) ───────────────────────────────────────

    public function test_condition_registry_is_closed(): void
    {
        $registry = new ConditionRegistry;
        $record = $this->stubRecord();

        $this->assertTrue($registry->has('always'));
        $this->assertTrue($registry->evaluate('always', $record, null));

        $registry->register('never', fn (HasWorkflow $r, $a) => false);
        $this->assertFalse($registry->evaluate('never', $record, null));

        $this->expectException(InvalidArgumentException::class);
        $registry->evaluate('eval("rm -rf")', $record, null);
    }

    // ── WorkflowValidator ───────────────────────────────────────────────────────

    public function test_valid_workflow_passes(): void
    {
        $wf = $this->buildValid($this->workflow());
        $this->assertSame([], app(WorkflowValidator::class)->validate($wf));
        $this->assertTrue(app(WorkflowValidator::class)->passes($wf));
    }

    public function test_validator_requires_exactly_one_initial_state(): void
    {
        $wf = $this->workflow();
        $wf->states()->create(['name' => 'A', 'slug' => 'a', 'category' => 'open', 'is_initial' => true]);
        $wf->states()->create(['name' => 'B', 'slug' => 'b', 'category' => 'closed', 'is_initial' => true, 'is_terminal' => true]);

        $errors = app(WorkflowValidator::class)->validate($wf->fresh(['states', 'transitions']));
        $this->assertNotEmpty(array_filter($errors, fn ($e) => str_contains($e, 'exactly one initial')));
    }

    public function test_validator_requires_a_terminal_state(): void
    {
        $wf = $this->workflow();
        $wf->states()->create(['name' => 'A', 'slug' => 'a', 'category' => 'open', 'is_initial' => true]);

        $errors = app(WorkflowValidator::class)->validate($wf->fresh(['states', 'transitions']));
        $this->assertNotEmpty(array_filter($errors, fn ($e) => str_contains($e, 'terminal')));
    }

    public function test_validator_rejects_category_outside_the_spine(): void
    {
        $wf = $this->workflow();
        $wf->states()->create(['name' => 'A', 'slug' => 'a', 'category' => 'open', 'is_initial' => true]);
        $wf->states()->create(['name' => 'B', 'slug' => 'b', 'category' => 'totally-made-up', 'is_terminal' => true]);

        $errors = app(WorkflowValidator::class)->validate($wf->fresh(['states', 'transitions']));
        $this->assertNotEmpty(array_filter($errors, fn ($e) => str_contains($e, 'outside the [submission] spine')));
    }

    public function test_validator_rejects_unknown_entity_type(): void
    {
        $wf = $this->workflow('mystery');
        $wf->states()->create(['name' => 'A', 'slug' => 'a', 'category' => 'open', 'is_initial' => true, 'is_terminal' => true]);

        $errors = app(WorkflowValidator::class)->validate($wf->fresh(['states', 'transitions']));
        $this->assertNotEmpty(array_filter($errors, fn ($e) => str_contains($e, 'No category spine')));
    }

    public function test_validator_rejects_foreign_state_and_unknown_condition(): void
    {
        $wf = $this->buildValid($this->workflow());

        $other = $this->workflow('submission', null);
        $foreign = $other->states()->create(['name' => 'X', 'slug' => 'x', 'category' => 'open']);

        $wf->transitions()->create([
            'from_state_id' => $wf->states->first()->id,
            'to_state_id' => $foreign->id,           // belongs to another workflow
            'name' => 'Leak', 'slug' => 'leak',
            'condition' => 'no_such_condition',       // not in the registry
        ]);

        $errors = app(WorkflowValidator::class)->validate($wf->fresh(['states', 'transitions']));
        $this->assertNotEmpty(array_filter($errors, fn ($e) => str_contains($e, 'to_state outside this workflow')));
        $this->assertNotEmpty(array_filter($errors, fn ($e) => str_contains($e, 'unknown condition')));
    }

    public function test_validator_rejects_invalid_scope_level(): void
    {
        $wf = $this->buildValid($this->workflow());
        $wf->transitions()->first()->update(['scope_level' => 'galaxy']);

        $errors = app(WorkflowValidator::class)->validate($wf->fresh(['states', 'transitions']));
        $this->assertNotEmpty(array_filter($errors, fn ($e) => str_contains($e, 'invalid scope_level')));
    }

    private function stubRecord(): HasWorkflow
    {
        return new class implements HasWorkflow
        {
            public function workflowEntityType(): string
            {
                return 'submission';
            }

            public function workflowSlug(): string
            {
                return 'default';
            }

            public function workflowContext(): array
            {
                return ['company_id' => null, 'branch_id' => null, 'department_id' => null];
            }
        };
    }
}
