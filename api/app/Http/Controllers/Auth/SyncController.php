<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserRoleAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class SyncController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->validate([
            'authentik_uid' => ['required', 'string'],
            'email' => ['required', 'email'],
            'name' => ['required', 'string'],
            'username' => ['required', 'string'],
            'avatar' => ['nullable', 'string'],
        ]);

        $user = User::firstOrNew(['authentik_uid' => $data['authentik_uid']]);

        $user->fill([
            'email' => $data['email'],
            'name' => $data['name'],
            'avatar' => $data['avatar'] ?? null,
            'is_active' => true,
            'last_login_at' => now(),
        ]);

        // SSO users authenticate via Authentik; a random password only satisfies the
        // NOT NULL constraint on first creation and is never a usable local credential.
        if (! $user->exists) {
            $user->password = Str::random(32);
        }

        $user->save();

        // Auto-assign super-admin to the configured bootstrap email on first login
        $superAdminEmail = config('portal.super_admin.email');
        if ($superAdminEmail && $user->email === $superAdminEmail && ! $user->hasAnyRole(['super-admin', 'developer'])) {
            $user->assignRole('super-admin');

            // Gap 7: also create a global UserRoleAssignment so ScopedPermissionService
            // resolves correctly without falling back to the flat Spatie model.
            $role = Role::findByName('super-admin', 'web');
            UserRoleAssignment::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'role_id' => $role->id,
                    'scope_type' => UserRoleAssignment::SCOPE_GLOBAL,
                    'scope_id' => null,
                ],
                ['assigned_by' => null],
            );
        }

        // Revoke previous login tokens and issue a fresh (expiring) one per session
        $token = $user->issueLoginToken();

        return response()->json([
            'token' => $token,
            'user' => $user->only(['id', 'name', 'email', 'username', 'authentik_uid', 'company_id', 'is_active']),
        ]);
    }
}
