<?php

namespace App\Http\Controllers;

use App\Core\Tenancy\ConfigResolver;
use App\Core\Tenancy\ConfigVisibilityScope;
use App\Models\AuditLog;
use App\Models\PortalApp;
use App\Services\AuditLogger;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * The apps launcher. Read-only for end users; admin CRUD of the catalog lands in the
 * Administration control plane (Phase 4).
 *
 * Both endpoints RESOLVE config by the user's company (company-override-else-global),
 * never through ConfigVisibilityScope — a launcher shows the effective tile for the
 * actor's company, not the union an admin may browse.
 */
class AppController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    /**
     * The tiles visible to the current user: every active global tile, with the user's
     * own company override collapsed in where one exists (override wins, one row per key).
     */
    public function index(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        $apps = PortalApp::withoutGlobalScope(ConfigVisibilityScope::class)
            ->where('is_active', true)
            ->where(function (Builder $q) use ($companyId) {
                $q->whereNull('company_id');
                if ($companyId !== null) {
                    $q->orWhere('company_id', $companyId);
                }
            })
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->groupBy('key')
            // company override wins over the global default for the same key
            ->map(fn ($group) => $group->firstWhere('company_id', $companyId) ?? $group->first())
            ->values()
            ->map(fn (PortalApp $app) => $this->format($app));

        return response()->json(['data' => $apps]);
    }

    /**
     * Audited launch broker: resolve the effective tile for the user's company, record
     * the launch, and hand back the target URL for the client to redirect to. The URL is
     * never exposed by index(), so every launch flows through this audit point.
     */
    public function launch(Request $request, string $key): JsonResponse
    {
        $app = (new ConfigResolver)->resolve(
            PortalApp::class,
            ['key' => $key],
            $request->user()->company_id,
            fn (Builder $q) => $q->where('is_active', true),
        );

        abort_if($app === null, 404, 'App not found.');
        abort_if(
            $app->kind !== PortalApp::KIND_EXTERNAL_SSO || empty($app->url),
            422,
            'This app is not externally launchable.',
        );

        $this->audit->log(AuditLog::ACTION_APP_LAUNCHED, $app, [
            'key' => $app->key,
            'is_global' => $app->isGlobalDefault(),
        ]);

        return response()->json(['url' => $app->url]);
    }

    private function format(PortalApp $app): array
    {
        return [
            'id' => $app->id,
            'key' => $app->key,
            'kind' => $app->kind,
            'name' => $app->name,
            'description' => $app->description,
            'icon' => $app->icon,
            'sort_order' => $app->sort_order,
            'is_global' => $app->isGlobalDefault(),
        ];
    }
}
