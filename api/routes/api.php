<?php

use App\Http\Controllers\Auth\LocalAuthController;
use App\Http\Controllers\Auth\SyncController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes  –  prefix: /api/v1
|--------------------------------------------------------------------------
|
| PUBLIC      – no auth required.
| SYNC        – service-to-service only (X-Service-Token header).
| PROTECTED   – requires a valid Sanctum Bearer token.
| ADMIN ONLY  – protected + super-admin / developer role required
|               while APP_ADMIN_ONLY=true.
|
| To add a new endpoint, drop it into the matching group below.
|
*/

Route::prefix('v1')->group(function () {

    // ── Public ────────────────────────────────────────────────────────────
    Route::get('status', fn () => response()->json(['status' => 'ok', 'version' => '1.0']));

    // ── Sync / Auth (Next.js → Laravel, shared secret) ────────────────────
    Route::middleware('service-token')->group(function () {
        Route::post('auth/sync',  SyncController::class)->middleware('throttle:20,1');
        Route::post('auth/local', LocalAuthController::class)->middleware('throttle:5,1');
    });

    // ── Protected + Admin-only (development default) ──────────────────────
    Route::middleware(['auth:sanctum', 'admin.only'])->group(function () {

        Route::get('me', fn () => response()->json(
            request()->user()->load(['company', 'branch', 'department', 'teams'])
        ));

        // Add resource routes here as the app grows:
        // Route::apiResource('companies', CompanyController::class);
        // Route::apiResource('users',     UserController::class);
    });
});
