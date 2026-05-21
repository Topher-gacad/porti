<?php

return [

    // Only the Next.js frontend is allowed to call the API.
    // In production, replace with your actual frontend domain(s).
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:3000')),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 86400,

    // Required for Sanctum cookie-based auth across origins
    'supports_credentials' => true,

];
