<?php

namespace Tests\Feature;

use App\Core\Tenancy\ConfigVisibilityScope;
use App\Models\Company;
use App\Modules\Submissions\FieldTypeRegistry;
use App\Modules\Submissions\FormDefinition;
use App\Modules\Submissions\FormResolver;
use App\Modules\Submissions\SchemaValidator;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;
use Tests\TestCase;

/**
 * Phase 3a: the form-definition config layer — closed field-type registry, typed schema
 * validation (not EAV), and company-tier form resolution.
 */
class FormDefinitionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    private function leaveSchema(): array
    {
        return [
            ['key' => 'reason', 'type' => 'textarea', 'label' => 'Reason', 'required' => true],
            ['key' => 'days', 'type' => 'integer', 'label' => 'Days', 'required' => true, 'min' => 1, 'max' => 30],
            ['key' => 'leave_type', 'type' => 'select', 'label' => 'Type', 'required' => true, 'options' => ['annual', 'sick', 'unpaid']],
        ];
    }

    private function form(string $key, ?int $companyId, int $version = 1, string $status = FormDefinition::STATUS_PUBLISHED): FormDefinition
    {
        return FormDefinition::withoutGlobalScope(ConfigVisibilityScope::class)->create([
            'company_id' => $companyId, 'key' => $key, 'name' => ucfirst($key),
            'field_schema' => $this->leaveSchema(), 'workflow_key' => $key,
            'naming_series' => strtoupper($key).'-', 'version' => $version, 'status' => $status,
        ]);
    }

    // ── FieldTypeRegistry ───────────────────────────────────────────────────────

    public function test_field_type_registry_is_closed(): void
    {
        $registry = new FieldTypeRegistry;
        $this->assertTrue($registry->isValid('currency'));
        $this->assertFalse($registry->isValid('rocket'));

        $this->expectException(InvalidArgumentException::class);
        $registry->rulesFor(['type' => 'rocket']);
    }

    // ── SchemaValidator: data ─────────────────────────────────────────────────────

    private function validator(): SchemaValidator
    {
        return app(SchemaValidator::class);
    }

    public function test_valid_data_passes(): void
    {
        $data = $this->validator()->validate($this->leaveSchema(), [
            'reason' => 'Holiday', 'days' => 5, 'leave_type' => 'annual',
        ]);

        $this->assertSame(5, $data['days']);
        $this->assertSame('annual', $data['leave_type']);
    }

    public function test_missing_required_field_fails(): void
    {
        $this->expectException(ValidationException::class);
        $this->validator()->validate($this->leaveSchema(), ['days' => 5, 'leave_type' => 'sick']);
    }

    public function test_wrong_type_fails(): void
    {
        $this->expectException(ValidationException::class);
        $this->validator()->validate($this->leaveSchema(), ['reason' => 'x', 'days' => 'not-a-number', 'leave_type' => 'sick']);
    }

    public function test_value_outside_select_options_fails(): void
    {
        $this->expectException(ValidationException::class);
        $this->validator()->validate($this->leaveSchema(), ['reason' => 'x', 'days' => 3, 'leave_type' => 'sabbatical']);
    }

    public function test_value_outside_min_max_fails(): void
    {
        $this->expectException(ValidationException::class);
        $this->validator()->validate($this->leaveSchema(), ['reason' => 'x', 'days' => 99, 'leave_type' => 'annual']);
    }

    public function test_multiselect_values_must_be_in_options(): void
    {
        $schema = [['key' => 'tags', 'type' => 'multiselect', 'label' => 'Tags', 'required' => true, 'options' => ['a', 'b']]];

        $ok = $this->validator()->validate($schema, ['tags' => ['a', 'b']]);
        $this->assertSame(['a', 'b'], $ok['tags']);

        $this->expectException(ValidationException::class);
        $this->validator()->validate($schema, ['tags' => ['a', 'z']]);
    }

    // ── SchemaValidator: schema structure ─────────────────────────────────────────

    public function test_schema_errors_catch_malformed_fields(): void
    {
        $errors = $this->validator()->schemaErrors([
            ['key' => 'a', 'type' => 'text'],
            ['key' => 'a', 'type' => 'integer'],            // duplicate key
            ['key' => 'b', 'type' => 'rocket'],             // unknown type
            ['key' => 'c', 'type' => 'select'],             // select without options
            ['type' => 'text'],                              // missing key
        ]);

        $this->assertNotEmpty(array_filter($errors, fn ($e) => str_contains($e, 'Duplicate field key [a]')));
        $this->assertNotEmpty(array_filter($errors, fn ($e) => str_contains($e, 'unknown type [rocket]')));
        $this->assertNotEmpty(array_filter($errors, fn ($e) => str_contains($e, 'must declare options')));
        $this->assertNotEmpty(array_filter($errors, fn ($e) => str_contains($e, 'missing a key')));
    }

    public function test_well_formed_schema_has_no_errors(): void
    {
        $this->assertSame([], $this->validator()->schemaErrors($this->leaveSchema()));
    }

    // ── FormResolver ──────────────────────────────────────────────────────────────

    public function test_form_is_shared_config(): void
    {
        $c = Company::create(['name' => 'Acme', 'code' => 'ACM', 'is_active' => true]);
        $this->form('leave', null);
        $this->form('leave', $c->id);

        $this->assertCount(1, FormDefinition::globalDefaults()->get());
        $this->assertCount(1, FormDefinition::forCompanyConfig($c->id)->get());
    }

    public function test_resolver_prefers_company_then_falls_back_to_global(): void
    {
        $c1 = Company::create(['name' => 'C1', 'code' => 'C1', 'is_active' => true]);
        $c2 = Company::create(['name' => 'C2', 'code' => 'C2', 'is_active' => true]);
        $global = $this->form('leave', null);
        $c1Form = $this->form('leave', $c1->id);

        $resolver = app(FormResolver::class);
        $this->assertSame($c1Form->id, $resolver->resolve('leave', $c1->id)?->id);
        $this->assertSame($global->id, $resolver->resolve('leave', $c2->id)?->id);
        $this->assertSame($global->id, $resolver->resolve('leave', null)?->id);
    }

    public function test_resolver_returns_latest_published_version(): void
    {
        $this->form('leave', null, version: 1);
        $v2 = $this->form('leave', null, version: 2);

        $this->assertSame($v2->id, app(FormResolver::class)->resolve('leave', null)?->id);
    }

    public function test_resolver_ignores_drafts_and_unknown_keys(): void
    {
        $this->form('leave', null, status: FormDefinition::STATUS_DRAFT);

        $this->assertNull(app(FormResolver::class)->resolve('leave', null));
        $this->assertNull(app(FormResolver::class)->resolve('nope', null));
    }
}
