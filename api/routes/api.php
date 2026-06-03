<?php

use App\Http\Controllers\Auth\LocalAuthController;
use App\Http\Controllers\Auth\SyncController;
use App\Http\Controllers\BranchAccessGrantController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\RoleAssignmentController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TeamMemberController;
use App\Http\Controllers\UserController;
use App\Services\ScopedPermissionService;
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

    // ── Authenticated + active (any role) ────────────────────────────────
    Route::middleware(['auth:sanctum', 'user.active'])->group(function () {

        Route::get('me', function () {
            $user = request()->user()->load([
                'company', 'branch', 'department',
                'roleAssignments.role.permissions',
            ]);

            $sps = app(ScopedPermissionService::class);

            return response()->json([
                'id'               => $user->id,
                'name'             => $user->name,
                'email'            => $user->email,
                'authentik_uid'    => $user->authentik_uid,
                'company_id'       => $user->company_id,
                'branch_id'        => $user->branch_id,
                'department_id'    => $user->department_id,
                'is_active'        => $user->is_active,
                'last_login_at'    => $user->last_login_at,
                'created_at'       => $user->created_at,
                'company'          => $user->company ? ['id' => $user->company->id, 'name' => $user->company->name] : null,
                'branch'           => $user->branch ? ['id' => $user->branch->id, 'name' => $user->branch->name] : null,
                'department'       => $user->department ? ['id' => $user->department->id, 'name' => $user->department->name] : null,
                'roles'            => $sps->allRoles($user),
                'permissions'      => $sps->allPermissions($user),
                'role_assignments' => $user->roleAssignments->map(fn ($a) => [
                    'id'         => $a->id,
                    'role'       => $a->role->name,
                    'scope_type' => $a->scope_type,
                    'scope_id'   => $a->scope_id,
                ]),
            ]);
        });

        Route::get('roles', [RoleController::class, 'index']);

        // List all assignable permissions (excludes legacy manage-* umbrella names)
        Route::get('permissions', function () {
            $perms = \Spatie\Permission\Models\Permission::orderBy('name')
                ->pluck('name')
                ->reject(fn ($p) => str_starts_with($p, 'manage-'))
                ->values();
            return response()->json(['data' => $perms]);
        });
    });

    // ── Protected + Admin-only (development default) ──────────────────────
    Route::middleware(['auth:sanctum', 'user.active', 'admin.only'])->group(function () {

        Route::apiResource('companies',   CompanyController::class);
        Route::apiResource('users',       UserController::class);
        Route::apiResource('branches',    BranchController::class);
        Route::apiResource('departments', DepartmentController::class);
        Route::apiResource('teams',       TeamController::class);

        // Scoped role assignments nested under a user
        Route::get('users/{user}/role-assignments',                  [RoleAssignmentController::class, 'index']);
        Route::post('users/{user}/role-assignments',                 [RoleAssignmentController::class, 'store']);
        Route::delete('users/{user}/role-assignments/{assignment}',  [RoleAssignmentController::class, 'destroy']);

        // Team member management
        Route::get('teams/{team}/members',            [TeamMemberController::class, 'index']);
        Route::post('teams/{team}/members',           [TeamMemberController::class, 'store']);
        Route::delete('teams/{team}/members/{user}',  [TeamMemberController::class, 'destroy']);

        // Role management (CRUD — locked roles are protected in controller)
        Route::post('roles',         [RoleController::class, 'store']);
        Route::patch('roles/{role}', [RoleController::class, 'update']);
        Route::delete('roles/{role}', [RoleController::class, 'destroy']);

        // Branch-level access grants (branch isolation exceptions)
        Route::get('companies/{company}/branch-access-grants',           [BranchAccessGrantController::class, 'index']);
        Route::post('companies/{company}/branch-access-grants',          [BranchAccessGrantController::class, 'store']);
        Route::delete('companies/{company}/branch-access-grants/{grant}', [BranchAccessGrantController::class, 'destroy']);

        // Audit log (read-only, company-scoped for admins)
        Route::get('audit-logs', [AuditLogController::class, 'index']);
    });
});
