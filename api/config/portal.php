<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Portal runtime settings
    |--------------------------------------------------------------------------
    |
    | These were previously read via env() at request time, which returns null
    | once `php artisan config:cache` runs (standard in production, and effectively
    | required by the documented Octane deployment). Reading them here bakes the
    | values into the cached config; callers use config('portal.*').
    |
    */

    // Development-phase gate: restrict the entire API to super-admins/developers.
    // Set APP_ADMIN_ONLY=false to open the API to ordinary roles.
    'admin_only' => (bool) env('APP_ADMIN_ONLY', true),

    // Shared secret for service-to-service sync requests (Next.js -> Laravel).
    // Must match AUTH_SYNC_SECRET in the web app's environment.
    'sync_secret' => env('AUTH_SYNC_SECRET'),

    // Enable the local break-glass password login (bypasses SSO).
    'allow_local_auth' => (bool) env('ALLOW_LOCAL_AUTH', false),

    // Lifetime of issued Sanctum login tokens, in minutes. Bounds the blast radius
    // of a leaked/cached token; on expiry the web client re-authenticates (a 401 from
    // the proxy triggers sign-in). Set to 0 to disable expiry. Default: 12 hours.
    'token_expiration_minutes' => (int) env('SANCTUM_TOKEN_EXPIRATION_MINUTES', 720),

    // Bootstrap super-admin: the user whose email matches this is granted
    // super-admin on first SSO sync (SyncController) and seeded by AdminSeeder.
    'super_admin' => [
        'email' => env('SUPER_ADMIN_EMAIL'),
        'password' => env('SUPER_ADMIN_PASSWORD'),
    ],

    // Bootstrap developer user (seeded by AdminSeeder in non-production).
    'dev_user' => [
        'email' => env('DEV_USER_EMAIL'),
        'password' => env('DEV_USER_PASSWORD'),
    ],

];
