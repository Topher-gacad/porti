<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// Validates internal service-to-service requests from the Next.js frontend.
// Set AUTH_SYNC_SECRET to the same value in both api/.env and web/.env.local.
class ServiceToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $secret = env('AUTH_SYNC_SECRET');

        if (!$secret || $request->header('X-Service-Token') !== $secret) {
            abort(Response::HTTP_UNAUTHORIZED, 'Invalid service token.');
        }

        return $next($request);
    }
}
