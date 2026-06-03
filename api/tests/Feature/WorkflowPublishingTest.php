<?php

namespace Tests\Feature;

use App\Core\Tenancy\ConfigVisibilityScope;
use App\Core\Workflow\Workflow;
use App\Core\Workflow\WorkflowGraph;
use App\Core\Workflow\WorkflowPublisher;
use App\Core\Workflow\WorkflowResolver;
use App\Core\Workflow\WorkflowValidationException;
use App\Models\Company;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Phase 2b: transactional publish/activate (one-active-version per workflow), immutable
 * snapshots, and company-tier version resolution (specific-else-global).
 */
class WorkflowPublishingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    private function company(string $code): Company
    {
        return Company::create(['name' => "Company $code", 'code' => $code, 'is_active' => true]);
    }

    /** A valid, ready-to-publish workflow: draft → review → done. */
    private function buildWorkflow(?int $companyId = null, string $slug = 'default'): Workflow
    {
        $wf = Workflow::withoutGlobalScope(ConfigVisibilityScope::class)->create([
            'company_id' => $companyId, 'entity_type' => 'submission', 'slug' => $slug, 'name' => 'Default',
        ]);

        $draft = $wf->states()->create(['name' => 'Draft', 'slug' => 'draft', 'category' => 'open', 'is_initial' => true]);
        $review = $wf->states()->create(['name' => 'In Review', 'slug' => 'review', 'category' => 'in_progress', 'is_approval_gate' => true]);
        $done = $wf->states()->create(['name' => 'Done', 'slug' => 'done', 'category' => 'closed', 'is_terminal' => true]);

        $wf->transitions()->create(['from_state_id' => $draft->id, 'to_state_id' => $review->id, 'name' => 'Submit', 'slug' => 'submit']);
        $wf->transitions()->create(['from_state_id' => $review->id, 'to_state_id' => $done->id, 'name' => 'Approve', 'slug' => 'approve', 'required_permission' => 'submissions.approve', 'scope_level' => 'company']);

        return $wf->fresh(['states', 'transitions']);
    }

    private function publisher(): WorkflowPublisher
    {
        return app(WorkflowPublisher::class);
    }

    public function test_publish_freezes_a_versioned_snapshot(): void
    {
        $wf = $this->buildWorkflow();

        $v1 = $this->publisher()->publish($wf);

        $this->assertSame(1, $v1->version);
        $this->assertFalse($v1->is_active);
        $this->assertCount(3, $v1->graph_snapshot['states']);
        $this->assertCount(2, $v1->graph_snapshot['transitions']);
        $this->assertDatabaseHas('config_revisions', [
            'configurable_type' => 'workflow', 'configurable_id' => $wf->id, 'action' => 'published', 'version' => 1,
        ]);
    }

    public function test_publishing_an_invalid_workflow_throws(): void
    {
        $wf = Workflow::withoutGlobalScope(ConfigVisibilityScope::class)->create([
            'company_id' => null, 'entity_type' => 'submission', 'slug' => 'broken', 'name' => 'Broken',
        ]);
        // No states at all → invalid.

        $this->expectException(WorkflowValidationException::class);
        $this->publisher()->publish($wf->fresh(['states', 'transitions']));
    }

    public function test_version_numbers_increment(): void
    {
        $wf = $this->buildWorkflow();

        $this->assertSame(1, $this->publisher()->publish($wf)->version);
        $this->assertSame(2, $this->publisher()->publish($wf->fresh(['states', 'transitions']))->version);
    }

    public function test_activate_enforces_one_active_version_per_workflow(): void
    {
        $wf = $this->buildWorkflow();
        $v1 = $this->publisher()->publishAndActivate($wf);
        $v2 = $this->publisher()->publish($wf->fresh(['states', 'transitions']));

        $this->publisher()->activate($v2);

        $this->assertFalse($v1->fresh()->is_active);
        $this->assertTrue($v2->fresh()->is_active);
        $this->assertSame(1, $wf->versions()->where('is_active', true)->count());

        $this->assertDatabaseHas('config_revisions', ['action' => 'deactivated', 'version' => 1]);
        $this->assertDatabaseHas('config_revisions', ['action' => 'activated', 'version' => 2]);
    }

    public function test_snapshot_is_immutable_after_publish(): void
    {
        $wf = $this->buildWorkflow();
        $v1 = $this->publisher()->publish($wf);

        // Edit the editable workflow after publishing.
        $wf->states()->create(['name' => 'Cancelled', 'slug' => 'cancelled', 'category' => 'cancelled', 'is_terminal' => true]);

        // The frozen version is unchanged; in-flight records pinned to v1 are unaffected.
        $this->assertCount(3, $v1->fresh()->graph_snapshot['states']);
    }

    public function test_workflow_graph_reads_the_snapshot(): void
    {
        $wf = $this->buildWorkflow();
        $graph = WorkflowGraph::fromVersion($this->publisher()->publish($wf));

        $this->assertSame('draft', $graph->initialState()['slug']);
        $this->assertSame('submit', $graph->transitionsFrom('draft')[0]['slug']);
        $this->assertSame('done', $graph->transition('approve')['to']);
    }

    // ── Company-tier resolution ─────────────────────────────────────────────────

    public function test_resolver_prefers_company_version_then_falls_back_to_global(): void
    {
        $c1 = $this->company('C1');
        $c2 = $this->company('C2');

        $global = $this->publisher()->publishAndActivate($this->buildWorkflow(null));
        $c1Version = $this->publisher()->publishAndActivate($this->buildWorkflow($c1->id));

        $resolver = app(WorkflowResolver::class);

        $this->assertSame($c1Version->id, $resolver->resolveVersion('submission', 'default', $c1->id)?->id);
        $this->assertSame($global->id, $resolver->resolveVersion('submission', 'default', $c2->id)?->id);
        $this->assertSame($global->id, $resolver->resolveVersion('submission', 'default', null)?->id);
    }

    public function test_resolver_falls_back_when_company_workflow_has_no_active_version(): void
    {
        $c1 = $this->company('C1');

        $global = $this->publisher()->publishAndActivate($this->buildWorkflow(null));
        // C1 has a workflow that is published but NEVER activated.
        $this->publisher()->publish($this->buildWorkflow($c1->id));

        $this->assertSame(
            $global->id,
            app(WorkflowResolver::class)->resolveVersion('submission', 'default', $c1->id)?->id,
        );
    }

    public function test_resolver_returns_null_when_nothing_resolves(): void
    {
        $this->assertNull(app(WorkflowResolver::class)->resolveVersion('submission', 'missing', null));
    }
}
