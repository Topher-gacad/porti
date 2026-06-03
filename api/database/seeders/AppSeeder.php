<?php

namespace Database\Seeders;

use App\Core\Tenancy\ConfigVisibilityScope;
use App\Models\PortalApp;
use Illuminate\Database\Seeder;

/**
 * Seeds the global external-SSO launcher tiles. ERPNext and Nextcloud are plain SSO
 * tiles (no data sync) — global defaults (company_id NULL) visible to every company.
 * Per-company overrides are authored later via the Administration → Apps surface.
 */
class AppSeeder extends Seeder
{
    public function run(): void
    {
        $tiles = [
            [
                'key' => 'erpnext',
                'name' => 'ERPNext',
                'description' => 'ERP, HR & accounting',
                'icon' => 'erpnext',
                'url' => env('ERPNEXT_URL', 'https://erp.example.com'),
                'sort_order' => 10,
            ],
            [
                'key' => 'nextcloud',
                'name' => 'Nextcloud',
                'description' => 'Files & collaboration',
                'icon' => 'nextcloud',
                'url' => env('NEXTCLOUD_URL', 'https://cloud.example.com'),
                'sort_order' => 20,
            ],
        ];

        foreach ($tiles as $tile) {
            // Scope-off + explicit company_id NULL: author a GLOBAL default tile. (In console
            // there is no authenticated user, so the scope no-ops anyway — explicit is safer.)
            PortalApp::withoutGlobalScope(ConfigVisibilityScope::class)->updateOrCreate(
                ['key' => $tile['key'], 'company_id' => null],
                array_merge($tile, [
                    'kind' => PortalApp::KIND_EXTERNAL_SSO,
                    'is_active' => true,
                ]),
            );
        }
    }
}
