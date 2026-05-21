<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SyncController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->validate([
            'authentik_uid' => ['required', 'string'],
            'email'         => ['required', 'email'],
            'name'          => ['required', 'string'],
            'username'      => ['required', 'string'],
            'avatar'        => ['nullable', 'string'],
        ]);

        $user = User::updateOrCreate(
            ['authentik_uid' => $data['authentik_uid']],
            [
                'email'         => $data['email'],
                'name'          => $data['name'],
                'avatar'        => $data['avatar'] ?? null,
                'is_active'     => true,
                'last_login_at' => now(),
            ],
        );

        // Auto-assign super-admin to the configured bootstrap email on first login
        $superAdminEmail = env('SUPER_ADMIN_EMAIL');
        if ($superAdminEmail && $user->email === $superAdminEmail && !$user->hasAnyRole(['super-admin', 'developer'])) {
            $user->assignRole('super-admin');
        }

        // Revoke previous login tokens and issue a fresh one per session
        $user->tokens()->where('name', 'login')->delete();
        $token = $user->createToken('login')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $user->only(['id', 'name', 'email', 'username', 'authentik_uid', 'company_id', 'is_active']),
        ]);
    }
}
