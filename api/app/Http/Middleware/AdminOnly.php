<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// Applied during the development phase to restrict API access to admins and developers.
// Disable by setting APP_ADMIN_ONLY=false in .env when the app is ready for wider rollout.
class AdminOnly
{
    private const PRIVILEGED_ROLES = ['super-admin', 'developer'];

    public function handle(Request $request, Closure $next): Response
    {
        if (!env('APP_ADMIN_ONLY', true)) {
            return $next($request);
        }

        $user = $request->user();

        if (!$user?->hasAnyRole(self::PRIVILEGED_ROLES)) {
            abort(Response::HTTP_FORBIDDEN, 'Access is currently restricted to administrators.');
        }

        return $next($request);
    }
}
