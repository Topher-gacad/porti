<?php

namespace App\Http\Controllers;

use App\Core\Tenancy\ConfigVisibilityScope;
use App\Modules\Submissions\FormDefinition;
use App\Modules\Submissions\FormResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Read-only catalog of the request types (forms) a user may file, resolved for their
 * company (override-else-global, latest published). Authoring forms is the Administration
 * surface (Phase 4); this is the end-user runtime view.
 */
class FormController extends Controller
{
    public function __construct(private readonly FormResolver $forms) {}

    /** The effective published form per key for the user's company. */
    public function index(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        $forms = FormDefinition::withoutGlobalScope(ConfigVisibilityScope::class)
            ->where('status', FormDefinition::STATUS_PUBLISHED)
            ->where(function ($q) use ($companyId) {
                $q->whereNull('company_id');
                if ($companyId !== null) {
                    $q->orWhere('company_id', $companyId);
                }
            })
            ->get()
            ->groupBy('key')
            ->map(function ($group) use ($companyId) {
                $company = $group->where('company_id', $companyId)->sortByDesc('version')->first();
                $global = $group->whereNull('company_id')->sortByDesc('version')->first();

                return $company ?? $global;
            })
            ->filter()
            ->sortBy('name')
            ->values()
            ->map(fn (FormDefinition $f) => [
                'key' => $f->key,
                'name' => $f->name,
                'icon' => $f->icon,
                'is_global' => $f->isGlobalDefault(),
            ]);

        return response()->json(['data' => $forms]);
    }

    /** The resolved form's renderable schema. */
    public function show(Request $request, string $key): JsonResponse
    {
        $form = $this->forms->resolve($key, $request->user()->company_id);

        abort_if($form === null, 404, 'Form not found.');

        return response()->json(['data' => [
            'key' => $form->key,
            'name' => $form->name,
            'icon' => $form->icon,
            'version' => $form->version,
            'workflow_key' => $form->workflow_key,
            'field_schema' => $form->field_schema,
        ]]);
    }
}
