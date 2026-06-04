<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()?->is_active) {
            abort(Response::HTTP_FORBIDDEN, 'Your account has been deactivated. Contact your administrator.');
        }

        return $next($request);
    }
}
