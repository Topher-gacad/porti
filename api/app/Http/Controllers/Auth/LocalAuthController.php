<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LocalLoginRequest;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class LocalAuthController extends Controller
{
    public function __invoke(LocalLoginRequest $request): JsonResponse
    {
        if (!env('ALLOW_LOCAL_AUTH', false)) {
            abort(Response::HTTP_FORBIDDEN, 'Local authentication is not enabled.');
        }

        $user = User::where('email', $request->email)
            ->where('is_active', true)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            AuditLog::create([
                'action'     => AuditLog::ACTION_AUTH_LOCAL_FAILED,
                'payload'    => ['email' => $request->email],
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json(
                ['message' => 'Invalid credentials.'],
                Response::HTTP_UNAUTHORIZED,
            );
        }

        AuditLog::create([
            'user_id'    => $user->id,
            'company_id' => $user->company_id,
            'action'     => AuditLog::ACTION_AUTH_LOCAL_SUCCESS,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $user->tokens()->where('name', 'login')->delete();
        $token = $user->createToken('login')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $user->only(['id', 'name', 'email', 'authentik_uid', 'company_id', 'is_active']),
        ]);
    }
}
