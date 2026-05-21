<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes  –  prefix: /api/v1
|--------------------------------------------------------------------------
|
| PUBLIC  — no auth required. Safe to call from anywhere.
|
| PROTECTED — requires a valid Sanctum Bearer token.
|             Run `php artisan install:api` if the sanctum guard is missing.
|
| ADMIN ONLY — protected + restricted to super-admin / developer roles
|              while APP_ADMIN_ONLY=true. Flip the flag to open access.
|
| To add a new endpoint:
|   • No auth needed?     → Public group
|   • Any logged-in user? → Protected group
|   • Dev/admin only?     → Admin group (default during development)
|
*/

Route::prefix('v1')->group(function () {

    // ── Public ────────────────────────────────────────────────────────────
    Route::get('status', fn () => response()->json([
        'status'  => 'ok',
        'version' => '1.0',
    ]));

    // ── Protected + Admin-only (development default) ──────────────────────
    Route::middleware(['auth:sanctum', 'admin.only'])->group(function () {

        Route::get('me', fn () => response()->json(request()->user()->load([
            'company', 'branch', 'department', 'teams',
        ])));

        // Add new resource routes here as the app grows:
        // Route::apiResource('companies', CompanyController::class);
        // Route::apiResource('users',     UserController::class);
    });
});
