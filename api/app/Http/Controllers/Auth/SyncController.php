<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use App\Models\UserRoleAssignment;
use App\Services\AuditLogger;
use App\Services\SsoCompanyResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Symfony\Component\HttpFoundation\Response;

/**
 * JIT SSO provisioning (Authentik → Next.js → here). Three provisioning paths, one
 * company-resolution rule (architecture §8):
 *   1. admin-invited — a pending row already exists by email with the right company_id;
 *      first SSO login links the authentik_uid onto it.
 *   2. JIT first login — resolve the company from the federated company_code/groups
 *      against companies.code; if nothing matches, leave company_id NULL → the user lands
 *      in the Unassigned review queue (never silently defaulted).
 *   3. returning user — matched by authentik_uid; profile refreshed, company left as-is
 *      (Porti owns the org hierarchy; SSO never moves a user between companies).
 */
class SyncController extends Controller
{
    public function __construct(
        private readonly SsoCompanyResolver $companyResolver,
        private readonly AuditLogger $audit,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->validate([
            'authentik_uid' => ['required', 'string'],
            'email' => ['required', 'email'],
            'name' => ['required', 'string'],
            'username' => ['required', 'string'],
            'avatar' => ['nullable', 'string'],
            'company_code' => ['nullable', 'string'],   // federated Authentik attribute
            'groups' => ['nullable', 'array'],           // federated Authentik groups
            'groups.*' => ['string'],
        ]);

        [$user, $linkedInvite] = $this->locateUser($data);

        $isNew = $user === null;
        if ($isNew) {
            $user = new User;
            // SSO users authenticate via Authentik; a random password only satisfies the
            // NOT NULL constraint and is never a usable local credential.
            $user->password = Str::random(32);
        }

        $user->fill([
            'authentik_uid' => $data['authentik_uid'],
            'email' => $data['email'],
            'name' => $data['name'],
            'avatar' => $data['avatar'] ?? null,
            'is_active' => true,
            'last_login_at' => now(),
        ]);

        // Company resolution runs ONLY while the user has no company — an invited user
        // already carries one, and a returning user's company is owned by admins.
        $unassigned = false;
        if ($user->company_id === null) {
            $company = $this->companyResolver->resolve($data['company_code'] ?? null, $data['groups'] ?? []);
            if ($company) {
                $user->company_id = $company->id;
            } else {
                $unassigned = true;
            }
        }

        $user->save();

        if ($linkedInvite) {
            $this->audit->log(AuditLog::ACTION_USER_LINKED_SSO, $user, ['email' => $user->email]);
        }
        if ($unassigned) {
            $this->audit->log(AuditLog::ACTION_USER_UNASSIGNED, $user, ['email' => $user->email]);
        }

        $this->bootstrapSuperAdmin($user);

        // Revoke previous login tokens and issue a fresh (expiring) one per session.
        $token = $user->issueLoginToken();

        return response()->json([
            'token' => $token,
            'user' => $user->only(['id', 'name', 'email', 'username', 'authentik_uid', 'company_id', 'is_active']),
        ]);
    }

    /**
     * Find the user this SSO identity maps to and whether we are linking a pending invite.
     *
     * @return array{0: User|null, 1: bool}
     */
    private function locateUser(array $data): array
    {
        // Returning user — stable Authentik identity.
        if ($user = User::where('authentik_uid', $data['authentik_uid'])->first()) {
            return [$user, false];
        }

        // Pending invite or local-only account — link the SSO identity onto it.
        $byEmail = User::where('email', $data['email'])->first();
        if ($byEmail === null) {
            return [null, false];
        }

        // Refuse to take over an email already bound to a DIFFERENT Authentik identity.
        if ($byEmail->authentik_uid !== null && $byEmail->authentik_uid !== $data['authentik_uid']) {
            $this->audit->log(AuditLog::ACTION_AUTH_SSO_FAILED, $byEmail, [
                'reason' => 'email_uid_conflict',
                'email' => $data['email'],
            ]);
            abort(Response::HTTP_CONFLICT, 'This email is already linked to a different identity.');
        }

        return [$byEmail, true];
    }

    private function bootstrapSuperAdmin(User $user): void
    {
        $superAdminEmail = config('portal.super_admin.email');

        if (! $superAdminEmail || $user->email !== $superAdminEmail || $user->hasAnyRole(['super-admin', 'developer'])) {
            return;
        }

        $user->assignRole('super-admin');

        // Also create a global UserRoleAssignment so ScopedPermissionService resolves
        // correctly without falling back to the flat Spatie model.
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
}
