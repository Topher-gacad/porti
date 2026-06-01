# Porti Codebase Audit

_Generated 2026-06-01 via a 10-dimension multi-agent audit with adversarial verification. 96 raw findings → 84 confirmed, 12 rejected as false-positive/overstated._

## Remediation status — updated 2026-06-01

Every **security** and **bug-risk** finding has been fixed; backend changes are covered by tests
(**100 passing, Pint-clean**). Frontend changes verified via `tsc --noEmit` + ESLint on the edited files.

| Group | Findings | Status |
|---|---|---|
| Write-side tenant isolation & role escalation | 1, 2, 3, 4, 6, 7 | ✅ Fixed + adversarially verified |
| `team_members` `withTimestamps()` crash | 8 | ✅ Fixed |
| Security-critical `env()` → config (`config:cache` safe) | 10, 15, 17 | ✅ Fixed + verified |
| Strict-`===` / FK integer casts (MySQL) | 5, 19 | ✅ Fixed + verified |
| Audit-log trustworthiness | 9, 20, 39, 51, 53 | ✅ Fixed + verified |
| Proxy hardening (path traversal, token revocation) | 23, 34 | ✅ Fixed (tsc + lint clean) |
| Sanctum token expiry; audit composite index | 21, 22 | ✅ Fixed |
| SSO `password` NOT NULL 500 (surfaced during fixes) | — | ✅ Fixed |

**Regressions caught by adversarial verification and fixed in-session:** `applyRoles` bulk-delete dropping
the `role.revoked` audit entry (HIGH), plus three low-severity hardening items.

**Open — need a product decision (intentionally not changed):**
18 (hard- vs soft-delete users), 82 (store `username` or drop it), 16 (sync trust model).

**Open — frontend, deferred by request ("build it later"):** the Priority-6 CRUD-page refactor, the
remaining frontend bug-risk/cleanliness items, and the pre-existing ESLint errors.

## Verdict

- **Cleanliness:** Grade: C-. The code is readable and consistently formatted, and the intent of each layer is legible — but "clean" here is skin-deep. Cleanliness is undermined by pervasive duplication that has already drifted: five near-identical API controllers (44) where TeamController has already diverged into a hardcoded paginate(20) bug (33); seven copy-pasted React CRUD pages with verbatim-duplicated modals (25); three duplicated actorAllowed*Ids helpers (49) and four duplicated grantee-matching closures (38); two parallel design-token systems with a mislabeled dead "legacy" block (80). There is real dead/misleading code: an empty TeamMember stub (52), an unused useToggleUserActive (71), an unreachable "locked" login state (73), fake "Keep me signed in"/"Forgot?" controls (74), an imported-but-unused permissions hook beside a hardcoded permission catalog (27), and placeholder "IT Portal" branding (81). Authorization logic is re-implemented inline in route closures (56) and AuditLogController (47) instead of going through policies. The duplication is the tell: when the same logic lives in 4-7 places, drift is not a risk, it is already present.

- **Sustainability:** Grade: C-. This codebase will get harder to change, not easier, unless the duplication is addressed now while it is still only 5-7 copies. Every cross-cutting change — pagination policy, audit semantics, modal a11y, error UX, the permission vocabulary — currently requires edits in multiple hand-synchronized places with no compile-time link between them (14, 25, 27, 30, 44, 46, 57, 69). The dual permission model (granular create/update/delete OR legacy manage-* umbrellas) is the most dangerous sustainability trap: the umbrellas silently override any attempt to revoke a granular capability, and the /permissions endpoint hides them so admins cannot even see what is granting access (14, 57). Numerous contracts are duplicated across the Laravel/TypeScript boundary as hand-maintained literals that already disagree (username that does not exist, 82; roles omitted from store/update, 83; /me role_assignments shape divergence, 84; RoleAssignment.assigned_by over-promised, 72). The bright spots: Conventional Commits + Release Please, an in-memory SQLite test harness, and a genuinely thoughtful scoped-permission/grant data model. The bones are good; the connective tissue is fragile.

- **Future-bug risk:** Grade: D. This is the weakest dimension and the reason the overall audit should be treated as urgent. There is a confirmed functional break waiting at the first real use: team_members withTimestamps() against a table with no updated_at column will throw on every attach (8). Beyond that, the dominant pattern is environment-divergent silent failure — bugs that pass green in the SQLite test harness and surface only in MySQL/Octane/config-cached production: strict-=== authz checks against un-cast string FKs that flip legitimate grants to false (5, 19), and security-critical env() reads (admin-only gate, sync secret, super-admin bootstrap, local-auth flag) that all return null under config:cache and fail open or closed unpredictably (10, 15, 17). The audit system — the system's stated compliance guarantee — silently drops every event with no authenticated user, including the SSO super-admin bootstrap (9), double-logs role changes with divergent payloads (20, 39), and never logs restore/forceDelete (51). The frontend adds silent data-loss-at-scale bugs (26, 28, 33), a token-cache/revocation lifecycle mismatch that breaks active users after any role change (34), and an auth flow that turns a transient /me failure into a fully-authenticated session with zero permissions (24). The common thread: failures are invisible until production, until scale, or until a non-SQLite driver — exactly the conditions the test suite does not exercise.

## Executive summary

Porti is an early-stage but ambitious multi-tenant portal where the authorization architecture is more elaborate than it is correct. The team clearly understood the right primitives — a global CompanyScope, resource policies, scoped role assignments, cross-tenant grants, audit logging via observers, a service-token gateway — but the wiring between those primitives has gaps that defeat the very isolation they exist to enforce. The most serious problems are not stylistic: there are at least four distinct, independently-exploitable tenant-isolation/privilege-escalation paths (findings 1, 2/3, 6, 7) by which an ordinary company-admin can plant or move records into other tenants or mint themselves super-admin-equivalent power. These are not edge cases; they sit on the main create/update paths of the core resources.

The unifying root cause is a consistent confusion between READ enforcement and WRITE enforcement. CompanyScope and the policies filter what a tenant can SEE, but almost nothing validates the tenant/role values a request WRITES. Client-supplied company_id/branch_id/department_id flow straight from `exists:`-only FormRequests into `Model::create()`, and the `BelongsToCompany` creating hook only fills company_id when it is empty — so an attacker-supplied foreign value always wins (findings 2, 3, 4, 6). Layered on top is a second root cause: the system silently fails closed or open in ways that only diverge in production — strict `===` comparisons of un-cast foreign keys (5, 19), runtime `env()` reads that return null under config:cache/Octane (10, 15, 17), and a `withTimestamps()` pivot with no `updated_at` column that breaks the first real team-member attach (8).

The frontend is cleaner in intent but is a near-total copy-paste of seven CRUD pages with no shared Modal/Table/Form primitives (25, 30, 64, 76), no centralized error/401 handling (29, 34), and several silent data-truncation bugs (`per_page=500` and page-1-only dropdowns, 26, 28, 33). The proxy is the single trust boundary that injects the user's Sanctum token, and it both allows path traversal out of /api/v1 (23) and caches a token the backend deliberately revokes on every role change (34). None of these alone is catastrophic, but together they describe a system whose security guarantees are asserted in the architecture and contradicted in the implementation.

## Systemic themes (root causes)

### Read isolation is enforced; write isolation is not — the central security flaw _(findings 1, 2, 3, 4, 6, 7)_

CompanyScope and the policies rigorously filter what a tenant can SEE, but the system trusts client-supplied tenant and role identifiers on WRITE. company_id/branch_id/department_id are validated only with unscoped `exists:` rules and flow straight into Model::create()/update(); the BelongsToCompany creating hook only fills company_id when empty, so an attacker-supplied foreign value always persists. Policies authorize against the ACTOR's own scope, never the target values in the payload. Role attachment via the user CRUD endpoint bypasses every escalation guard the dedicated RoleAssignmentController was built to enforce. The architecture assumes the scope protects writes; it does not.

### Tests pass on SQLite; production runs on MySQL/Octane with config caching — and the difference is load-bearing _(findings 5, 10, 15, 17, 19, 36, 55)_

Multiple correctness- and security-critical behaviors are coupled to runtime conditions the test harness never reproduces. Strict === comparisons of scope_id against un-cast foreign keys work under SQLite (PDO returns ints) but silently fail under MySQL (PDO returns strings), denying legitimately-authorized users. Every security-relevant feature flag and secret is read via env() at request time, which returns null once php artisan config:cache runs (standard in production, effectively required by the Octane deployment). The result is a class of bugs structurally invisible until the first non-test environment.

### The audit log is treated as a compliance guarantee but is implemented as best-effort _(findings 9, 20, 39, 51, 52, 53, 55)_

CLAUDE.md states 'all changes are tracked via AuditLog,' yet AuditLogger silently no-ops when there is no authenticated user (dropping the SSO super-admin bootstrap, queued jobs, console commands); role changes are logged twice with divergent payloads from both the observer and the controller; restore() and forceDelete() on soft-deletable entities are never logged; team membership audit logic is duplicated inline in the controller so any second attach/detach path skips it; created_at depends entirely on a DB default and is never set explicitly; and a failed-login listener writes AuditLog directly without try/catch, so a logging failure can turn a 401 into a 500. A security control that is silently incomplete is worse than a known-absent one.

### Pervasive duplication with no shared abstraction — already drifting _(findings 25, 30, 33, 38, 44, 49, 52, 57, 61, 64, 69, 76, 77)_

The same logic is copy-pasted 4-7 times across both stacks with no single source of truth, and the copies have already diverged in ways that produced bugs. Backend: five near-identical CRUD controllers (TeamController already diverged to a hardcoded paginate(20)), duplicated scope-resolution helpers, duplicated grantee-matching closures, duplicated permission lists in the seeder. Frontend: seven CRUD pages re-implementing the same modal/table/form/pagination scaffolding, three duplicated token-fetch helpers, query keys and endpoint URLs as bare literals across 11 hook files, and a duplicated service catalog that already disagrees between two files. Every cross-cutting change now requires hand-synchronized edits, and drift is not hypothetical — it is observed.

### Silent failure as a default posture — errors are swallowed, truncated, or hidden _(findings 9, 24, 26, 28, 29, 33, 37, 61)_

Across both stacks the system prefers to silently degrade rather than surface an error. Backend scope/policy denials return false rather than abort, env() failures return null, scope no-ops for unauthenticated/null-company contexts. Frontend: useAllX hooks silently truncate tenant data at per_page=500, the department dropdown loads only page 1, three token helpers collapse every error (network, 5xx, parse, wrong-password) into an indistinguishable null, mutation errors render a hardcoded 'Failed to save', and a transient /me failure yields an authenticated session with empty permissions that looks like privilege loss rather than an error. These bugs are correctness-affecting but invisible until someone notices missing data or a mysterious 403.

### Hand-maintained contracts across the Laravel/TypeScript boundary that already disagree _(findings 45, 46, 68, 72, 82, 83, 84)_

The two stacks share many implicit contracts (response envelopes, resource shapes, permission vocabulary, query keys) that are duplicated as literals rather than generated or centralized, and several already mismatch reality: SyncedUser declares a username field the backend never returns (no such column); UserResource omits roles on store/update but includes it on index; the /me handler hand-builds a role_assignments shape missing three fields the RoleAssignment type marks required; mutation hooks type their return as the model but actually return the raw AxiosResponse; response envelopes and 201-vs-200 status codes are inconsistent across endpoints. Most are dormant only because no consumer reads the divergent field yet — the type system is actively asserting falsehoods.

### The legacy manage-* umbrella permission model silently defeats granular control _(findings 13, 14, 40, 48, 57)_

Every policy accepts a manage-* umbrella as an OR-alternative to granular create/update/delete permissions, the seeder grants those umbrellas to mid-level roles, and the /permissions endpoint hides the umbrella names. The consequence is a hidden grant: any future attempt to revoke a granular capability is silently overridden by an umbrella the role still holds and an admin cannot even see. Compounding this, role-assignment escalation is gated purely on an integer level table (with all custom roles collapsed to level 30) rather than on the actual permission set, so the level proxy drifts from real privilege as custom roles are created.

## Top priorities

1. **Close the write-side tenant-isolation and role-escalation holes (findings 1, 2, 3, 4, 6, 7)**  
   These are the highest-severity, currently-exploitable defects: an ordinary company-admin can plant or move users/branches/departments/teams into other tenants and attach super-admin-class roles via the user CRUD path, defeating the entire multi-tenant security model. Fix as one coordinated change: (a) never trust client-supplied company_id/branch_id/department_id from non-privileged actors — force company_id = actor's company on create and reject company moves on update, or validate the supplied IDs against the actor's allowedCompanyIds in the FormRequest/policy; (b) make BelongsToCompany::creating reject (not silently honor) a foreign company_id for non-privileged actors; (c) route all role attachment in UserController::applyRoles through the same assertCanGrantRole/assertScopeAccess/locked-role guards as RoleAssignmentController; and (d) forbid non-super-admin actors from creating SCOPE_GLOBAL assignments. Add regression tests for each cross-tenant write and the global-scope escalation. Nothing else matters if the isolation boundary is porous.

2. **Move every security-critical env() read into config files (findings 10, 15, 17)**  
   The admin-only gate, the service sync secret, the super-admin bootstrap email, and the local-auth break-glass flag are all read via env() at request time. Under php artisan config:cache (standard in production and effectively required by the documented Octane runtime), env() returns null — so the admin-only gate can be bypassed, sync requests rejected, the super-admin bootstrap silently never fires, and local auth dies. These are invisible in every test and in any non-cached dev environment, then fail silently and unpredictably on the first real deploy. The fix is mechanical (a config/portal.php reading env() once, callers using config()), low-risk, and removes a whole class of deploy-time security surprises.

3. **Fix the strict-=== authz comparison and add integer casts to foreign keys (findings 5, 19)**  
   ScopedPermissionService::covers() compares cast int scope_id against un-cast context IDs with strict ===. Under SQLite (the test driver) PDO returns ints and tests stay green; under MySQL/MariaDB in production PDO returns these columns as strings, so the comparison silently returns false and every legitimately-scoped permission check fails. This is a production-only authorization outage hiding behind a green test suite. Cast both sides (or add company_id/branch_id/department_id integer casts to the models) and add a unit test that passes string context IDs to lock the contract. Pair this with fixing the team_members withTimestamps() / missing updated_at break (finding 8), which throws on the first real attach — both are concrete production breakages masked by the test harness.

4. **Harden the Next.js proxy: validate the path and handle 401 (findings 23, 34)**  
   The proxy is the single trust boundary that injects the user's Sanctum token onto upstream requests, and it has two real problems. Path traversal: `/api/v1/../../admin` resolves out of the API surface, attaching the user's bearer token to arbitrary Laravel routes (Telescope/Horizon/internal endpoints) — verified empirically. Assert the resolved pathname still starts with /api/v1/ and reject ./..​/empty segments. Lifecycle mismatch: the backend revokes a user's login token on every role change, but the proxy caches the token in the NextAuth JWT with no refresh path, so an active user's app silently breaks with persistent 401s after any role edit. Handle upstream 401 by forcing re-auth. Both are central to the auth posture and currently undefended.

5. **Make the audit log trustworthy and pick one source of truth (findings 9, 20, 39, 51, 53)**  
   The audit log is sold as the system's compliance guarantee but is implemented as best-effort: it silently drops every event without an authenticated user (including the security-most-relevant SSO super-admin bootstrap), double-logs role changes with divergent payloads, never records restore/forceDelete, and depends on a DB default for the one timestamp that matters. Allow a system/null actor instead of no-opping, consolidate role-change logging to the observer (removing the duplicate controller writes), add restored()/forceDeleted() handlers, and set created_at explicitly. An incomplete-but-believed-complete audit trail is a liability in a security review; this should be fixed before the system is relied upon for forensics.

6. **Extract shared abstractions before the duplication ossifies (findings 25, 30, 44, 69, plus 14/57)**  
   This is the highest-leverage sustainability investment and the window is now, while it is still only 5-7 copies and the drift is repairable. On the frontend, extract a Modal/DataTable/ConfirmDeleteModal/CrudPageShell set and a queryKeys/endpoints registry — this alone would cut the dashboard files by more than half, fix a11y in one place, and make cache-invalidation typo-proof. On the backend, extract a base CRUD controller / shared pagination resolution and a single TenantAccessResolver used by both the scope and the policies. Concurrently, resolve the dual permission vocabulary (granular vs hidden manage-* umbrellas) down to one model, because that ambiguity is both a sustainability trap and a latent authorization hazard. Deferring this guarantees the already-observed drift (TeamController's divergent paginate(20), the disagreeing service catalogs and resource shapes) will multiply.

## Findings overview

Severity: 🔴 2 critical · 🟠 8 high · 🟡 24 medium · ⚪ 50 low  

Category: 12 security · 37 bug-risk · 17 sustainability · 18 cleanliness

## Confirmed findings (detailed)

### 1. 🔴 [CRITICAL · security] Global-scope role assignments bypass tenant isolation and the scope-access check

**File:** `api/app/Http/Controllers/RoleAssignmentController.php` — `174-197 (assertScopeAccess) + api/app/Services/ScopedPermissionService.php:90-91 (covers SCOPE_GLOBAL)`  
**Dimension:** authz-policies

**Problem:** assertScopeAccess() returns early and performs NO restriction when scope_type === SCOPE_GLOBAL (line 176). assertCanGrantRole() only checks role *level*, never scope. A non-super-admin company-admin (level 70, holds 'assign-roles') can therefore create a UserRoleAssignment with scope_type='global' for any sub-70 role (e.g. branch-manager, manager, or a custom role). In ScopedPermissionService::covers(), SCOPE_GLOBAL unconditionally returns true for ANY context (lines 90-91), so the granted role's permissions now apply across EVERY company/branch/department, not just the actor's tenant. This is a cross-tenant privilege escalation: a company-admin can mint a user with branch-manager/manager permissions that the policies will honor against other companies' resources. The UserPolicy::assignRoles gate only checks the target user's own context, so it does not stop this.

**Evidence:** `if ($scopeType === UserRoleAssignment::SCOPE_GLOBAL || $scopeId === null) { return; }  // assertScopeAccess short-circuits, then covers() returns `true` for SCOPE_GLOBAL in any context`

**Fix:** Forbid non-super-admin/developer actors from creating SCOPE_GLOBAL assignments entirely, OR require an explicit scope for non-privileged actors. In assertScopeAccess(), do NOT short-circuit on SCOPE_GLOBAL for non-privileged actors — instead abort(403) unless the actor is super-admin/developer. Add a regression test asserting a company-admin cannot create a global-scoped assignment.

### 2. 🔴 [CRITICAL · security] Mass-assignment of company_id/branch_id/department_id lets a tenant admin create/move users into other tenants

**File:** `api/app/Http/Controllers/UserController.php` — `28-48, 57-78`  
**Dimension:** controllers-requests

**Problem:** store() and update() pass $request->validated() straight into User::create()/update(). StoreUserRequest/UpdateUserRequest both permit client-supplied company_id, branch_id and department_id (all merely 'exists:...' validated, which runs an unscoped raw query and is NOT filtered by CompanyScope). UserPolicy::create() only checks the ACTOR's company_id ($user->company_id !== null && scopedCanAny(... ['company_id' => $user->company_id])), never the target company_id in the payload. The BelongsToCompany::creating hook only auto-fills company_id when it is empty(), so a supplied value wins. CompanyScope does not apply to INSERTs/UPDATEs. Net effect: a company-admin of company A who holds create-users/manage-users can POST a user with company_id=B (or update an existing user's company_id/branch_id) and successfully plant or move an account into another tenant — a direct tenant-isolation / privilege-escalation bypass.

**Evidence:** `UserController::store(): $data = $request->validated(); ... $user = User::create($data);  // company_id from client survives. UserPolicy::create() only validates ['company_id' => $user->company_id] (the actor's own).`

**Fix:** Do not trust client company_id/branch_id/department_id for non-super-admins. Either strip them in the controller and force company_id = auth()->user()->company_id for the create path, or validate in the policy/FormRequest that the target company_id (and branch/department) is within the actor's allowed company IDs (reuse the same set CompanyScope::allowedCompanyIds computes). For update(), reject changes that move a record to a company the actor cannot access.

### 3. 🟠 [HIGH · bug-risk] scope_id matched with strict === against un-cast foreign keys — silent authz failure on MySQL

**File:** `api/app/Services/ScopedPermissionService.php` — `92-103`  
**Dimension:** authz-policies

**Problem:** covers() compares the assignment's scope_id (cast to 'integer' in UserRoleAssignment) against context values using strict ===. The context values originate from model attributes such as $branch->company_id, $target->company_id, $department->branch_id (see UserPolicy/DepartmentPolicy). Those foreign-key columns are NOT declared in any $casts (User has no int cast for company_id/branch_id/department_id; Company casts only booleans). Under the test driver (in-memory SQLite) PDO returns integers, so === passes and tests are green. Under MySQL/MariaDB in production, PDO returns these column values as STRINGS by default, so (int)scope_id === (string)context_id is false. Result: scoped permission checks silently return false and legitimately-authorized users are denied (or, combined with the Spatie fallback when a user has zero assignments, behavior diverges between environments). This is a classic test-vs-prod contract drift that will surface only in production.

**Evidence:** `UserRoleAssignment::SCOPE_COMPANY => isset($context['company_id']) && $context['company_id'] !== null && $assignment->scope_id === $context['company_id'],`

**Fix:** Cast both sides before comparison, e.g. (int) $assignment->scope_id === (int) $context['company_id'], or use loose == . Better: add 'company_id'=>'integer','branch_id'=>'integer','department_id'=>'integer' casts to User (and the other models) so context values are always ints. Add a test that exercises covers() with string context ids to lock the behavior.

### 4. 🟠 [HIGH · security] Branch/Department/Team store accept client company_id and can be created in another tenant

**File:** `api/app/Http/Requests/Branch/StoreBranchRequest.php` — `19 (Branch); StoreDepartmentRequest.php:19-20; StoreTeamRequest.php:19`  
**Dimension:** controllers-requests

**Problem:** StoreBranchRequest, StoreDepartmentRequest and StoreTeamRequest all allow a nullable client-supplied company_id (Department also branch_id) validated only with 'exists' (unscoped). The corresponding controllers do Model::create(array_merge(['is_active'=>true], $request->validated())). BranchPolicy::create()/DepartmentPolicy::create()/TeamPolicy::create() authorize purely on the ACTOR's own company_id, never on the payload company_id. As with users, the BelongsToCompany creating hook only fills company_id when empty, so a supplied company_id of another tenant is persisted. A company-admin can therefore create branches/departments/teams owned by a foreign company.

**Evidence:** `BranchController::store(): Branch::create(array_merge(['is_active'=>true], $request->validated())); StoreBranchRequest rule: 'company_id' => ['nullable','integer','exists:companies,id']. BranchPolicy::create only checks ['company_id' => $user->company_id].`

**Fix:** Remove company_id (and Department's branch_id) from the Store FormRequests for non-privileged callers, or validate it against the actor's allowed company/branch IDs in the policy. Let the BelongsToCompany hook own company_id assignment, and for super-admin paths accept an explicit value through a dedicated guarded code path.

### 5. 🟠 [HIGH · security] applyRoles in UserController re-implements scoped-assignment logic that belongs in RoleAssignmentController/a service, and skips all the escalation guards

**File:** `api/app/Http/Controllers/UserController.php` — `93-122`  
**Dimension:** controllers-requests

**Problem:** UserController::applyRoles (invoked by store/update when 'roles' is present) creates UserRoleAssignment rows and calls syncRoles directly. Crucially it does NOT apply any of the privilege-escalation protections that RoleAssignmentController enforces (assertCanGrantRole level check, assertScopeAccess, locked-role protection). StoreUserRequest only validates roles.* with 'exists:roles,name'. So an admin who can create/update users (create-users/update-users) can attach ANY role by name — including 'super-admin' or 'developer' — to a user at company scope, fully bypassing the carefully-built RoleAssignmentController guards (which exist specifically to prevent this). This is a privilege-escalation path through the user CRUD endpoints.

**Evidence:** `applyRoles(): foreach($roleNames as $roleName){ $role = Role::findByName($roleName,'web'); $user->roleAssignments()->create([...]); } $user->syncRoles($roleNames); No level/locked-role/scope check. Reachable via StoreUserRequest 'roles.*'=>['string','exists:roles,name'] with no role-name restriction.`

**Fix:** Route role attachment through the same guard logic as RoleAssignmentController (assertCanGrantRole/assertScopeAccess/locked-role block) by extracting it into a shared service the user CRUD also calls, or forbid setting 'roles' via user store/update and require the dedicated role-assignment endpoints. At minimum reject locked/system roles and roles above the actor's level here.

### 6. 🟠 [HIGH · bug-risk] team_members pivot uses withTimestamps() but has no updated_at column

**File:** `api/app/Models/Team.php` — `26 (and User.php:65, migration 2026_05_11_091738_create_team_members_table.php:14-19)`  
**Dimension:** models-observers-services

**Problem:** Both Team::members() and User::teams() declare ->belongsToMany(..., 'team_members')->withTimestamps(). withTimestamps() instructs Eloquent to write BOTH created_at and updated_at on attach()/sync()/updateExistingPivot(). The team_members migration only creates created_at (line 17), no updated_at column. When TeamMemberController::store() runs $team->members()->attach($user->id), Eloquent will issue an INSERT that includes updated_at, which fails with a 'no such column'/'unknown column' error on every strict DB driver (MySQL, Postgres, and SQLite). Adding/removing team members is core functionality, so this breaks at the first real attach. It likely passes only because no test exercises attach, or detach (which doesn't touch updated_at) is the only path tested.

**Evidence:** `Team.php:26  return $this->belongsToMany(User::class, 'team_members')->withTimestamps();  // migration has only: $table->timestamp('created_at')->useCurrent();`

**Fix:** Either add $table->timestamp('updated_at')->nullable() to the team_members migration, or drop ->withTimestamps() from both relationships and rely solely on the created_at default. Pick one and make both relationship declarations consistent.

### 7. 🟠 [HIGH · bug-risk] AuditLogger silently drops every audit entry when there is no authenticated user

**File:** `api/app/Services/AuditLogger.php` — `16-18`  
**Dimension:** models-observers-services

**Problem:** AuditLogger::log() returns early whenever auth()->check() is false. This is the SOLE audit path wired into every observer (UserObserver, BranchObserver, etc.) via app(AuditLogger::class)->log(...). As a result, any model mutation performed outside an authenticated request produces NO audit record at all: the SSO sync flow (SyncController::__invoke creates/updates User and a super-admin UserRoleAssignment before any auth() context exists), queued jobs, scheduled tasks, and console commands. For an auth/multi-tenant system whose stated guarantee is 'all changes are tracked via AuditLog', this is a silent compliance hole — the most security-relevant event (bootstrap super-admin grant in SyncController.php:43) is exactly the one that won't be logged. The failed-login listener in AppServiceProvider had to bypass AuditLogger entirely and write AuditLog::create() directly (boot():44-52), which is itself evidence the abstraction is too narrow.

**Evidence:** `AuditLogger.php:16  if (!auth()->check()) { return; }  // observers call this for every CRUD event`

**Fix:** Allow a system/null actor: when auth()->check() is false, still write the row with user_id=null and an explicit 'system' marker (the audit_logs.user_id column is already nullable). Optionally accept an explicit actor argument so SyncController can attribute the SSO-created user. Do not silently no-op.

### 8. 🟠 [HIGH · bug-risk] Security-critical middleware reads config via env() instead of config(), breaking under config:cache

**File:** `api/app/Http/Middleware/AdminOnly.php` — `17`  
**Dimension:** routes-middleware-infra

**Problem:** AdminOnly (`env('APP_ADMIN_ONLY', true)`), ServiceToken (`env('AUTH_SYNC_SECRET')`), LocalAuthController (`env('ALLOW_LOCAL_AUTH', false)`), SyncController/AdminSeeder (`env('SUPER_ADMIN_EMAIL')`, etc.) all call env() at runtime. Laravel's own docs warn that once `php artisan config:cache` runs (standard in production, and effectively required by the Octane deployment this repo targets), the .env file is no longer loaded and every runtime `env()` returns null. Consequences are severe and silent: `env('APP_ADMIN_ONLY', true)` returns null -> falsy -> the admin-only gate is BYPASSED for every authenticated user; `env('AUTH_SYNC_SECRET')` returns null -> `!$secret` is true -> all sync/login requests are rejected (or, with a different ordering, the gate opens); `env('SUPER_ADMIN_EMAIL')` returns null so the bootstrap super-admin auto-assignment silently never fires. None of these failures are observable until production.

**Evidence:** `if (!env('APP_ADMIN_ONLY', true)) {
    return $next($request);
}`

**Fix:** Move every one of these to config files (e.g. config/portal.php returning `['admin_only' => env('APP_ADMIN_ONLY', true), 'sync_secret' => env('AUTH_SYNC_SECRET'), 'allow_local_auth' => env('ALLOW_LOCAL_AUTH', false), ...]`) and read via `config('portal.admin_only')`. env() must only ever be called inside config/*.php.

### 9. 🟠 [HIGH · security] User create/update lets a tenant admin plant or move users into ANY company (cross-tenant write / privilege escalation)

**File:** `api/app/Http/Controllers/UserController.php` — `28-48 (store), 57-78 (update)`  
**Dimension:** tenant-isolation

**Problem:** StoreUserRequest and UpdateUserRequest validate company_id/branch_id/department_id only with `exists:companies,id` etc. — they are NOT constrained to the requester's allowed tenant. UserController::store passes the raw validated $data (including an attacker-supplied company_id) straight into User::create($data). The BelongsToCompany::creating hook only fills company_id when it is empty (BelongsToCompany.php:14-18), so an explicit foreign company_id is preserved. The create policy (UserPolicy::create) authorizes against the REQUESTER's own company only — `scopedCanAny($user, [...], ['company_id' => $user->company_id])` — never against the target company_id. Net effect: a company-A admin can POST a user with company_id=B and create a user (optionally with roles) inside company B. UpdateUserRequest is worse: UserPolicy::update checks permission against the TARGET's current company, but nothing prevents setting company_id/branch_id to a different value in the same request, letting an admin reassign a user into a foreign tenant. This is a tenant-isolation bypass on writes — the global CompanyScope only filters reads, not the values written.

**Evidence:** `UserController.php:41 `$user = User::create($data);` with $data containing unvalidated company_id; UserPolicy.php:19-23 create() checks `['company_id' => $user->company_id]` (self, not target); BelongsToCompany.php:15 `if (auth()->check() && empty($model->company_id))` only defaults when empty.`

**Fix:** Do not trust client-supplied company_id/branch_id/department_id from non-super-admins. Either strip them and force `company_id = auth()->user()->company_id` for tenant admins, or add a FormRequest rule validating that the supplied company_id is in the requester's allowedCompanyIds and branch_id/department_id belong to that company. On update, reject changes to company_id unless the actor is super-admin/developer. Authorize create against the TARGET company_id, not the requester's.

### 10. 🟠 [HIGH · security] Department (and any BelongsToCompany model) create accepts arbitrary foreign company_id/branch_id

**File:** `api/app/Http/Controllers/DepartmentController.php` — `23-30`  
**Dimension:** tenant-isolation

**Problem:** Same write-side bypass as users, generalized. StoreDepartmentRequest only validates `company_id`/`branch_id` with `exists:` rules, and DepartmentController::store does `Department::create($data)`. DepartmentPolicy::create cannot see the resource yet, so it authorizes against the actor's own scope, while the actual company_id written comes from the request body. A tenant-A admin can create a Department (or Branch/Team via the analogous controllers) with company_id=B and branch_id pointing at company B's branch. Because the BelongsToCompany::creating default only applies when company_id is empty, the foreign value persists. This creates records in another tenant that the creator may not even be able to read back (scope hides them), producing silent cross-tenant data injection.

**Evidence:** `StoreDepartmentRequest.php:19-20 `'company_id' => ['nullable','integer','exists:companies,id'], 'branch_id' => ['nullable','integer','exists:branches,id']` (no tenant restriction); DepartmentController.php:29 `Department::create($data)`.`

**Fix:** Centralize tenant enforcement on writes: in BelongsToCompany::creating, if a non-privileged actor supplies a company_id not in their allowed set, reject (throw/authorization error) rather than silently honoring it; never accept client company_id for tenant admins. Validate branch_id/department_id belong to the resolved company_id.

### 11. 🟡 [MEDIUM · security] Privilege-level model collapses all custom roles into one tier, enabling lateral custom-role escalation

**File:** `api/app/Http/Controllers/RoleAssignmentController.php` — `21-30, 141-170`  
**Dimension:** authz-policies

**Problem:** assertCanGrantRole() derives an actor's max level from ROLE_LEVELS, defaulting every custom (non-system) role to DEFAULT_CUSTOM_LEVEL=30, and forbids granting a role whose level is >= the actor's level. Two problems: (1) The escalation guard is purely level-based and ignores the actual permission SET of the role being granted. RoleController Gap 2 prevents creating a role with permissions the actor lacks, but does NOT prevent an actor from *assigning* an existing custom role (level 30) that contains powerful permissions to a target — assertCanGrantRole only sees level 30 < actorLevel and allows it, so any actor with assign-roles and level >31 can grant any custom role regardless of what permissions it carries. (2) All custom roles share level 30, so a custom-role holder (actorLevel 30) can assign no custom roles (30 >= 30 denied) — yet a manager (level 40) can assign every custom role even ones far more powerful than 'manager'. The level table is a fragile proxy for actual privilege and will drift from the permission reality as custom roles are created.

**Evidence:** `$roleLevel = self::ROLE_LEVELS[$role->name] ?? self::DEFAULT_CUSTOM_LEVEL; ... abort_if($roleLevel >= $actorLevel, 403, ...);  // no inspection of $role->permissions`

**Fix:** Gate role *assignment* on the permission set, not just an integer level: when a non-privileged actor assigns a role, assert the role's permissions are a subset of the actor's own scoped permissions (reuse the Gap-2 subset logic from RoleController::assertPermissionsWithinActorScope). Keep the level check as a secondary guard for named system roles only.

### 12. 🟡 [MEDIUM · sustainability] manage-* legacy umbrella permissions silently bypass granular controls and are inconsistently applied

**File:** `api/database/seeders/RolePermissionSeeder.php` — `49-55, 62 vs api/app/Policies/*Policy.php (scopedCanAny with manage-*)`  
**Dimension:** authz-policies

**Problem:** Every resource policy accepts a legacy 'manage-*' umbrella permission as an OR-alternative to the granular create/update/delete permissions (e.g. BranchPolicy::delete accepts 'delete-branches' OR 'manage-branches'). The seeder grants 'manage-teams' to branch-manager and manager and 'manage-*' to company-admin. This means a branch-manager who is intentionally NOT given 'delete-teams'... actually IS given delete via 'manage-teams' (line 55 grants both 'delete-teams' and 'manage-teams'), and manager (line 62) gets 'manage-teams' which silently grants delete-teams even if the granular list were trimmed. The umbrella defeats the purpose of granular permissions: any future attempt to revoke a granular capability is silently overridden by the umbrella the role still holds. The /permissions endpoint even hides manage-* names (routes/api.php:81), so admins editing roles in the UI cannot see or remove the very permission that is granting broad access — a hidden grant.

**Evidence:** `scopedCanAny($user, ['delete-teams', 'manage-teams'], ...) — and seeder branchManagerPerms includes both 'delete-teams' and 'manage-teams'; routes hide them: ->reject(fn ($p) => str_starts_with($p, 'manage-'))`

**Fix:** Decide on one model. If migrating to granular, stop granting manage-* in the seeder and remove the manage-* alternatives from policies; if keeping umbrellas, surface them in the /permissions list so they can be managed. Do not maintain a hidden permission that overrides visible ones.

### 13. 🟡 [MEDIUM · bug-risk] AdminOnly middleware uses env() at request time, breaking under config caching / Octane

**File:** `api/app/Http/Middleware/AdminOnly.php` — `17`  
**Dimension:** authz-policies

**Problem:** AdminOnly::handle() calls env('APP_ADMIN_ONLY', true) on every request. Per Laravel docs, env() returns null once config is cached (php artisan config:cache, which is standard in production) because the real .env is not loaded. The CLAUDE.md states the API runs on Laravel Octane; under Octane env() reads are also unreliable across worker boots. If env() returns null, !null is true, so the early-return is skipped and the admin-only restriction REMAINS on (fail-safe in this direction) — but the documented toggle 'set APP_ADMIN_ONLY=false to open the app' will silently NOT work in a config-cached/Octane deployment, and the inverse (operator believing the gate is on while a cached config value differs) is equally confusing. The gate's behavior becomes environment-dependent and non-deterministic.

**Evidence:** `if (!env('APP_ADMIN_ONLY', true)) { return $next($request); }`

**Fix:** Read this flag through config(): add 'admin_only' => env('APP_ADMIN_ONLY', true) to a config file and call config('app.admin_only') in the middleware. Never call env() outside config files in a cached/Octane app.

### 14. 🟡 [MEDIUM · bug-risk] TeamController.index ignores per_page; useAllTeams() silently truncates to 20 teams

**File:** `api/app/Http/Controllers/TeamController.php` — `14-19`  
**Dimension:** contract-consistency

**Problem:** TeamController::index hardcodes `Team::paginate(20)` and ignores the `per_page` query parameter, unlike every sibling controller (CompanyController L22-24, BranchController L18-20, DepartmentController L18-20, UserController L21-24) which all do `min((int) request()->integer('per_page', 20), 500)`. The frontend hook useAllTeams() (web/src/hooks/useTeams.ts L23-34) sends `per_page: 500` expecting to receive every team in one page and then returns only `data.data`. Because the controller caps at 20, useAllTeams() returns at most the first 20 teams globally. This is then consumed in web/src/app/dashboard/companies/page.tsx L195-200 as `companyTeams = allTeams.filter(t => t.company_id === company.id)` to populate the branch-access-grant grantee dropdown. Once the system has more than 20 teams total, teams are silently dropped from the dropdown with no error — a classic invisible-until-data-grows contract drift. The 'all' query also has staleTime 2min so the truncation persists in cache.

**Evidence:** `TeamController: `return TeamResource::collection(Team::paginate(20));`  vs  useTeams.ts useAllTeams: `apiClient.get<Paginated<Team>>('/teams', { params: { per_page: 500 } }) ... return data.data``

**Fix:** Make TeamController::index honor `per_page` identically to the other controllers: `$perPage = min((int) request()->integer('per_page', 20), 500); return TeamResource::collection(Team::paginate($perPage));`

### 15. 🟡 [MEDIUM · bug-risk] Proxy caches the Sanctum token in the NextAuth session; role changes revoke the token and cause silent persistent 401s

**File:** `web/src/app/api/v1/[...path]/route.ts` — `9-13, 30`  
**Dimension:** contract-consistency

**Problem:** Every frontend API call goes through this proxy, which forwards `Authorization: Bearer ${session.apiToken}` where apiToken is baked into the NextAuth JWT at login (web/src/auth.ts L100-118). However the backend deliberately revokes the user's `login` token whenever their roles change: RoleAssignmentController::store L92 and destroy L120 both do `$user->tokens()->where('name','login')->delete()`, and SyncController L55 / LocalAuthController L47 revoke prior login tokens on each new login. After an admin changes a logged-in user's roles, that user's cached session.apiToken becomes invalid and every proxied call returns 401 (route.ts has no refresh path) until they fully sign out and back in. The frontend hooks surface this only as a generic query error, not as a re-auth prompt, so it presents as the app mysteriously breaking for an active user. This is a contract/lifecycle mismatch between the backend's token-rotation-on-permission-change policy and the frontend's assumption that a session token is valid for the session lifetime.

**Evidence:** `route.ts: `if (!session?.apiToken) { return 401 } ... Authorization: \`Bearer ${session.apiToken}\``  with no 401-driven refresh; backend RoleAssignmentController: `$user->tokens()->where('name', 'login')->delete();` on store and destroy`

**Fix:** Handle upstream 401 in the proxy by clearing/refreshing the NextAuth session (force re-auth) instead of passing the 401 through opaquely, or stop deleting the active user's token on role change and instead invalidate cached permissions another way. At minimum, document this coupling so the frontend can react to 401 with a forced sign-out.

### 16. 🟡 [MEDIUM · security] SyncController trusts unauthenticated identity claims and auto-grants super-admin by email match

**File:** `api/app/Http/Controllers/Auth/SyncController.php` — `16-52`  
**Dimension:** controllers-requests

**Problem:** auth/sync is gated only by the service-token middleware, then updateOrCreate matches on authentik_uid and OVERWRITES email/name from the request body on every call. The bootstrap block then grants 'super-admin' whenever user->email === env('SUPER_ADMIN_EMAIL'). Because email is attacker-controllable input (not a verified claim re-fetched from the IdP here), anyone who can reach this endpoint with the service token and craft a payload {authentik_uid:<any>, email:<SUPER_ADMIN_EMAIL>} obtains a super-admin session token. Even without the bootstrap email, updateOrCreate-on-email lets a second authentik_uid hijack an existing account's email (email is not enforced unique here at the app layer). This couples the whole privilege model to a single header secret with no replay/issuer verification.

**Evidence:** `User::updateOrCreate(['authentik_uid'=>...],[ 'email'=>$data['email'], ... ]); then if ($superAdminEmail && $user->email === $superAdminEmail && !hasAnyRole) $user->assignRole('super-admin').`

**Fix:** Verify the email is a trusted, IdP-asserted claim (validate the token/signature server-side rather than accepting raw body), and gate super-admin bootstrap on a one-time/idempotent path tied to authentik_uid rather than a mutable email. Reject sync if the inbound email already belongs to a different authentik_uid.

### 17. 🟡 [MEDIUM · bug-risk] Local-auth feature flag and SSO bootstrap email read from env() at request time, bypassing config cache

**File:** `api/app/Http/Controllers/Auth/LocalAuthController.php` — `17`  
**Dimension:** controllers-requests

**Problem:** LocalAuthController uses env('ALLOW_LOCAL_AUTH', false) and SyncController uses env('SUPER_ADMIN_EMAIL') directly inside request handling. In any environment that runs `php artisan config:cache` (standard in production, and effectively required under Octane), env() returns NULL for all values once the config is cached, because the real .env is not loaded into the process. Result: ALLOW_LOCAL_AUTH silently becomes false (local break-glass login dies) AND SUPER_ADMIN_EMAIL becomes null so the super-admin bootstrap silently never fires — a security-relevant feature flag failing open/closed unpredictably depending on deploy state. Under Octane this is worse: env reads are resolved once per worker boot and won't reflect runtime changes.

**Evidence:** `if (!env('ALLOW_LOCAL_AUTH', false)) { abort(403); } and $superAdminEmail = env('SUPER_ADMIN_EMAIL');`

**Fix:** Move these into config/*.php (e.g. config('auth.allow_local'), config('auth.super_admin_email')) and read via config() in the controllers. Never call env() outside config files in a cached/Octane app.

### 18. 🟡 [MEDIUM · bug-risk] User is hard-deleted while UserObserver logs a 'user.deleted' audit event, and other entities soft-delete — inconsistent lifecycle

**File:** `api/app/Models/User.php` — `16-19 (model), UserObserver.php:34-40, UserController.php:80-87`  
**Dimension:** models-observers-services

**Problem:** Branch, Department, Team and Company all use SoftDeletes; User does not (no SoftDeletes trait, no deleted_at column in the migration). So UserController::destroy()->$user->delete() performs a PERMANENT delete. Because users.id is referenced by audit_logs.user_id with nullOnDelete(), user_role_assignments with cascadeOnDelete(), and team_members with cascadeOnDelete(), deleting a user silently NULLs the actor on all of that user's historical audit rows and cascade-destroys their role assignments and team memberships. The UserObserver::deleted hook fires on this permanent delete and writes a 'user.deleted' audit entry, giving the false impression the record is recoverable like the other entities. This is both a data-integrity surprise (audit history loses its actor) and a consistency defect across the model layer.

**Evidence:** `User.php:19  use HasFactory, Notifiable, HasApiTokens, HasRoles, BelongsToCompany;  // no SoftDeletes, unlike Branch/Department/Team. UserController.php:84  $user->delete();`

**Fix:** Decide on one deletion semantics for tenant entities. If users should be recoverable and keep audit integrity, add SoftDeletes to User plus a deleted_at migration column (the destroy() + observer already assume soft semantics). If hard delete is intended, change audit_logs/team_members FKs to preserve history and document why User differs from every other entity.

### 19. 🟡 [MEDIUM · bug-risk] ScopedPermissionService::covers() uses strict === between scope_id and context ids, fragile to type drift

**File:** `api/app/Services/ScopedPermissionService.php` — `95, 99, 103`  
**Dimension:** models-observers-services

**Problem:** covers() compares $assignment->scope_id === $context['company_id'] (and branch/department) with strict identity. This relies on BOTH operands always being native ints. scope_id is protected by the model cast (UserRoleAssignment $casts scope_id=>integer), but the context values are supplied by callers and are not guaranteed to be ints: policies pass $branch->company_id / $user->company_id (DB-backed, usually int) but several call sites and any future caller passing a route-bound or request value (commonly a numeric string) would silently fail the === check and DENY a permission the user actually has. Strict comparison in an authorization grant path is a fail-shut surprise that is hard to diagnose — it produces no error, just intermittent 403s after a refactor or a new caller. This is a leaky abstraction: correctness depends on every caller pre-casting context ints.

**Evidence:** `ScopedPermissionService.php:95  && $assignment->scope_id === $context['company_id'],`

**Fix:** Cast both sides before comparison, e.g. compare (int) $assignment->scope_id === (int) $context['branch_id'], or normalize the $context array once at the top of can()/covers(). Add a unit test that passes string context ids to lock the contract.

### 20. 🟡 [MEDIUM · sustainability] UserRoleAssignmentObserver re-queries the role and User on every create/delete, causing N+1 and a redundant double audit path

**File:** `api/app/Observers/UserRoleAssignmentObserver.php` — `14-25, 30-40`  
**Dimension:** models-observers-services

**Problem:** On every UserRoleAssignment create/delete the observer runs optional($assignment->role()->first())->name and User::find($assignment->user_id) — two extra DB round-trips per assignment, which becomes an N+1 problem during the role-sync loops in UserController::applyRoles() (creates one assignment per role name) and any bulk grant. Worse, RoleAssignmentController::store()/destroy() ALSO call $this->audit->log(ACTION_ROLE_ASSIGNED/REVOKED, ...) directly (lines 85, 113) for the very same event the observer logs. So a single role assignment through the controller writes TWO ACTION_ROLE_ASSIGNED audit rows with overlapping-but-different payloads (controller includes none of the 'assigned_to' block; observer includes it). This duplicate-write + payload divergence is contract drift waiting to confuse anyone reading the audit trail.

**Evidence:** `UserRoleAssignmentObserver.php:18  $target = User::find($assignment->user_id);  // plus RoleAssignmentController.php:85 logs the same ACTION_ROLE_ASSIGNED`

**Fix:** Choose ONE audit source for role changes. Since the observer fires for all paths (controller, SyncController firstOrCreate, seeders), remove the manual $this->audit->log() calls from RoleAssignmentController and let the observer be authoritative — but first have the controller eager-load role/user (or pass them) so the observer doesn't re-query. Reconcile the payload shape in one place.

### 21. 🟡 [MEDIUM · security] Sanctum login tokens are issued with no expiration

**File:** `api/app/Http/Controllers/Auth/SyncController.php` — `56`  
**Dimension:** routes-middleware-infra

**Problem:** Both token-minting paths call `$user->createToken('login')` with no expiry argument, and there is no sanctum config file in the repo (api/config/sanctum.php is absent) to set a global `expiration`. The personal_access_tokens migration has an `expires_at` column, but it is never populated. Result: every issued bearer token is valid forever until the next login deletes the previous 'login' token. A leaked token (logs, proxy, browser storage on the Next side) grants indefinite API access with no server-side TTL. The 'revoke previous login token' logic only revokes on a *successful re-login*, which a thief has no reason to trigger.

**Evidence:** `$user->tokens()->where('name', 'login')->delete();
$token = $user->createToken('login')->plainTextToken;`

**Fix:** Publish config/sanctum.php and set `'expiration' => 60*8` (or appropriate), or pass an explicit expiry to createToken: `$user->createToken('login', ['*'], now()->addHours(8))`. Ensure a scheduled `sanctum:prune-expired` runs.

### 22. 🟡 [MEDIUM · sustainability] Most common audit-log query has no supporting composite index

**File:** `api/database/migrations/2026_05_11_091739_create_audit_logs_table.php` — `26-28`  
**Dimension:** routes-middleware-infra

**Problem:** AuditLogController::index for regular (non-super) admins runs `AuditLog::where('company_id', X)->latest('created_at')->paginate(50)` plus optional `where('action', ...)`. The migration indexes `['user_id','created_at']`, `['target_type','target_id']`, and a standalone `company_id`, but not `['company_id','created_at']` nor `action`. audit_logs is the highest-write, monotonically-growing table in the system; the per-company time-ordered list (the default admin view) will degrade to a filesort over the whole company partition as rows accumulate, and `where('action', ...)` is unindexed entirely. This is exactly the kind of schema decision that is painful to fix once the table is large.

**Evidence:** `$table->index(['user_id', 'created_at']);
$table->index(['target_type', 'target_id']);
$table->index('company_id');  // no ['company_id','created_at'] and no index on `action``

**Fix:** Replace the bare `company_id` index with `['company_id','created_at']` and add an index on `action` (or `['company_id','action','created_at']` to cover the filtered admin view). Add via a new migration.

### 23. 🟡 [MEDIUM · bug-risk] Soft-deleted parent companies/branches do not propagate isolation; cascade vs soft-delete mismatch

**File:** `api/database/migrations/2026_05_26_000002_create_branch_access_grants_table.php` — `14-15`  
**Dimension:** tenant-isolation

**Problem:** Company and Branch use SoftDeletes, but branch_access_grants (and cross_tenant_grants) foreign keys use cascadeOnDelete()/nullOnDelete() which only fire on HARD deletes. When a Company or Branch is soft-deleted, its grants remain is_active=true and continue to widen visibility via CompanyScope::allowedCompanyIds/allowedBranchIds and BasePolicy::inAllowedCompany — pointing at a tenant that has been 'deleted'. Conversely CrossTenantGrant::active() and the scope will happily resolve target_company_id to a soft-deleted company. This is a future bug: deactivating a tenant does not revoke standing cross-tenant access.

**Evidence:** `branch_access_grants migration:14-15 `foreignId('company_id')->constrained()->cascadeOnDelete()` while Company.php:11 `use SoftDeletes;` — DB cascade never triggers on soft delete.`

**Fix:** On soft-deleting a Company/Branch, deactivate (is_active=false) its related grants and any grants targeting it, via a model observer. Alternatively join against the parent and exclude soft-deleted targets in scopeActive().

### 24. 🟡 [MEDIUM · bug-risk] BasePolicy::inAllowedCompany ignores branch/department grant narrowing — company grant implies all branches

**File:** `api/app/Policies/BasePolicy.php` — `46-84`  
**Dimension:** tenant-isolation

**Problem:** inAllowedCompany returns true if ANY active CrossTenantGrant targets the company, regardless of that grant's target_branch_id/target_department_id. A grant intended to expose only one branch (target_branch_id set) is treated as company-wide access by every policy that calls inAllowedCompany (e.g. UserPolicy::view). This is contract drift between the grant data model (which records branch/department narrowing) and the enforcement, and mirrors the scope's allowedCompanyIds which also plucks target_company_id while ignoring target_branch_id. Result: a narrow grant over-grants at the policy layer.

**Evidence:** `BasePolicy.php:71-83 CrossTenantGrant::active()->where('target_company_id',$companyId)->...->exists() with no consideration of target_branch_id/target_department_id; CompanyScope.php:67 likewise `->pluck('target_company_id')`.`

**Fix:** Either enforce branch/department narrowing in inAllowedCompany and allowedCompanyIds (when target_branch_id is set, only grant access to resources in that branch), or explicitly document that CrossTenantGrant is company-level only and remove/repurpose target_branch_id/target_department_id to avoid misleading future callers.

### 25. 🟡 [MEDIUM · security] Catch-all API proxy allows path traversal past /api/v1, injecting the user's Sanctum token into arbitrary Laravel routes

**File:** `web/src/app/api/v1/[...path]/route.ts` — `15-33`  
**Dimension:** web-auth-proxy

**Problem:** The proxy builds the upstream URL with `new URL(`/api/v1/${path.join('/')}`, API_URL)`. `[...path]` segments are not validated, and the WHATWG URL parser normalizes `..` segments. I verified empirically: a request to `/api/v1/../../admin` resolves to `http://API_HOST/admin`, and `/api/v1/a/../../../etc` resolves to `http://API_HOST/etc`. The proxy then attaches `Authorization: Bearer <session.apiToken>` to that request. So any authenticated portal user can use the proxy to send authenticated requests to ANY path on the Laravel host outside the intended `/api/v1` API surface (e.g. Telescope/Horizon dashboards, Octane internal endpoints, or any web route mounted on the same host). The host itself stays fixed so this is not full SSRF, but it is a real authorization-scope/credential-injection escape: the proxy is the trust boundary that injects privileged credentials, and it leaks them onto unintended routes.

**Evidence:** `const targetUrl = new URL(`/api/v1/${path.join('/')}`, API_URL)  // ['..','..','admin'] -> http://host/admin`

**Fix:** Reject any path segment that is `.`/`..`/empty or contains `/` or `%2e`, and assert the final resolved pathname still starts with `/api/v1/` before fetching. E.g. after building `targetUrl`, `if (!targetUrl.pathname.startsWith('/api/v1/')) return 400`. Decode-and-check each segment, or use `encodeURIComponent` on each segment before joining.

### 26. 🟡 [MEDIUM · bug-risk] Session callback casts JWT fields with `as` instead of validating, so a roles/permissions shape change becomes a silent client-side authz bug

**File:** `web/src/auth.ts` — `108-119`  
**Dimension:** web-auth-proxy

**Problem:** The `session` callback blind-casts `token.roles as string[]`, `token.permissions as string[]`, `token.companyId as number | null`. These values originate from `fetchUserProfile` (`web/src/lib/api.ts`), which on ANY API error or network failure returns `null`, and the `authorize` callbacks then default to `roles: []`/`permissions: []` (auth.ts:39-41, 71-73). That means a transient `/api/v1/me` failure during login produces a fully authenticated session with NO roles/permissions — the user lands on a dashboard that hides everything (`usePermissions` only does `.includes`), looking like a silent privilege loss rather than an error. Worse, the client-side `usePermissions`/`hasAnyRole` gates in `dashboard/page.tsx` are purely cosmetic; combined with the unvalidated cast, a contract change on the Laravel side (e.g. permissions returned as objects) would not throw — it would silently make `can()` always false or always pass. The casts hide the coupling between the Next session shape and the Laravel `/me` response.

**Evidence:** `session.user.roles = (token.roles as string[]) ?? []   // token.roles came from `profile?.roles ?? []` where profile may be null on transient failure`

**Fix:** Parse the `/me` profile with a Zod schema in `fetchUserProfile` and fail the login (return null from authorize) if the profile cannot be fetched/validated, rather than defaulting roles/permissions to empty arrays. Keep treating client-side permission checks as UX-only and rely on the Laravel policies for real enforcement (which the backend does).

### 27. 🟡 [MEDIUM · sustainability] Pervasive inline styles instead of design tokens/utility classes make the UI unmaintainable

**File:** `web/src/app/login/_components/LoginForm.tsx` — `120-498 (and AllServicesModal.tsx 116-345, LandingHero.tsx 1-220)`  
**Dimension:** web-components-ui

**Problem:** Nearly every element across the login form, modal, and landing components is styled with large inline `style={{...}}` objects containing dozens of hardcoded magic numbers (e.g. borderRadius: 10, padding '10px 12px', fontSize: 13.5, marginTop: 22, box-shadow strings repeated verbatim). The same field-wrapper style (flex row + icon + input + border on error) is duplicated for the identifier and password inputs in LoginForm, and again for the search input in AllServicesModal. There is no shared Input/Button/Card primitive even though Tailwind + a full CSS token palette already exist. Inline styles cannot be deduplicated, cannot use pseudo-selectors/media queries, defeat the existing Tailwind setup, and force re-creation of new style objects on every render. This is the single biggest maintainability liability in this dimension: any spacing/radius/typography change requires hand-editing dozens of scattered literals.

**Evidence:** `border: `1px solid ${emailError ? 'var(--rose-600)' : 'var(--ink-100)'}`, borderRadius: 10, padding: '10px 12px', marginBottom: 14 ... (identical block repeated for password field at lines 362-371 and for search at AllServicesModal lines 197-203)`

**Fix:** Extract reusable primitives — `<TextField icon error />`, `<Button variant>`, `<Card>` — and move the repeated literals into Tailwind utility classes or a small set of CSS classes in globals.css keyed off the existing CSS variables. The landing components already prove the pattern works (they use Tailwind classes); apply it consistently to LoginForm and AllServicesModal.

### 28. 🟡 [MEDIUM · cleanliness] Inputs are not associated with their labels (no htmlFor/id) — accessibility failure

**File:** `web/src/app/login/_components/LoginForm.tsx` — `302-331, 344-384`  
**Dimension:** web-components-ui

**Problem:** The 'Work email'/'username' and 'Password' labels are bare <label> elements with no `htmlFor`, and the corresponding <input>s have no `id`. Clicking the label does not focus the field, and screen readers cannot reliably announce the label for the input. The password input also wraps no programmatic relationship to the caps-lock and error banners (no aria-describedby / aria-invalid). For an authentication screen — the most accessibility-sensitive page in the app — this is a real a11y defect, not cosmetic.

**Evidence:** `<label style={{...}}>{fieldLabel}</label> ... <input type={allowLocalAuth ? 'email' : 'text'} ... {...register('identifier')} />  // no id / htmlFor pairing`

**Fix:** Add matching id/htmlFor (e.g. id="identifier"/htmlFor="identifier"), set aria-invalid on the input when emailError/passwordError, and link the ErrorBanner and caps-lock hint via aria-describedby. Consider role="alert" on ErrorBanner so it is announced when it appears.

### 29. 🟡 [MEDIUM · bug-risk] Reveal component renders content invisible (opacity:0) until client JS runs — content loss without JS and CLS risk

**File:** `web/src/components/landing/Reveal.tsx` — `14-40`  
**Dimension:** web-components-ui

**Problem:** Reveal initializes `visible=false` and renders children with `opacity: 0` until an IntersectionObserver fires on the client. Because almost every landing section (Apps header, Workshop cards, Timeline entries, Numbers stats) is wrapped in Reveal, the entire landing page is server-rendered but visually blank until hydration and the observer callback run. If JS fails, is slow, or is disabled, the whole page stays invisible — bad for resilience and SEO-perceived content, and it guarantees a layout/opacity flash on every load. There is also no `prefers-reduced-motion` opt-out, so users who request reduced motion still get the fade/translate.

**Evidence:** `const [visible, setVisible] = useState(false) ... style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(18px)' }}`

**Fix:** Default to visible and only animate-in when the observer confirms support, or gate the hidden state behind a 'mounted' flag so SSR/no-JS shows content. Respect `@media (prefers-reduced-motion: reduce)` to skip the transform/opacity animation.

### 30. 🟡 [MEDIUM · sustainability] Seven near-identical CRUD pages with no shared table/modal/page abstraction

**File:** `web/src/app/dashboard/branches/page.tsx` — `26-316 (and companies, teams, departments, users, roles pages)`  
**Dimension:** web-dashboard-pages

**Problem:** All seven dashboard pages independently re-implement the same scaffolding: the fixed modal overlay (`fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4` + `bg-slate-800 rounded-xl shadow-2xl`), the header with an X close button, the form/footer button pair, the page shell (title + `{data.meta.total} total` + `isLoading`/`isError` paragraphs + `<table>` + `<Pagination>`), and the modal-target state machine. The `ConfirmDeleteModal` is copy-pasted almost verbatim across branches, departments, teams, companies and users (same markup, same `del.isPending`/`del.isError` handling, only the noun differs). This is the single largest maintainability liability in this dimension: any change to modal a11y, error display, table styling, or pagination behavior must be made in 4-7 places, and they will inevitably drift (they already differ slightly in colSpan, error copy, and permission gating).

**Evidence:** `ConfirmDeleteModal appears 5x; e.g. branches/page.tsx:152-197 vs departments/page.tsx:174-219 vs teams/page.tsx:231-264 are structurally identical.`

**Fix:** Extract shared primitives: a `<Modal>` (overlay + focus trap + Escape handling), a generic `<ConfirmDeleteModal title noun isError isPending onConfirm onClose>`, a `<DataTable columns rows emptyLabel>` and a `<CrudPageShell title total isLoading isError>` wrapper. Each page then declares only its columns, schema, and hook bindings. This would cut these files by well over half and make a11y/error fixes single-point.

### 31. 🟡 [MEDIUM · bug-risk] Department form's branch dropdown only loads page 1 of branches

**File:** `web/src/app/dashboard/departments/page.tsx` — `39, 124-128`  
**Dimension:** web-dashboard-pages

**Problem:** The department create/edit modal populates its Branch <select> from `useBranches(1)` — the paginated list hook fixed to page 1 (`const { data: branchData } = useBranches(1)`), then iterates `branchData?.data`. Every other page that needs a full option list uses the dedicated `useAllBranches()` (per_page: 500) hook. As soon as a company has more branches than one page (default Laravel page size 15), branches beyond the first page silently disappear from the dropdown and cannot be selected when creating/editing a department. This is a data-integrity-affecting silent failure: a department gets assigned to no branch (or the wrong one) simply because the right branch wasn't on page 1.

**Evidence:** `departments/page.tsx:39 `const { data: branchData } = useBranches(1)` then 124 `{branchData?.data.map((branch) => (``

**Fix:** Replace `useBranches(1)` with `useAllBranches()` (already imported and used by users/companies pages) and iterate the returned array directly: `const { data: branches = [] } = useAllBranches()`.

### 32. 🟡 [MEDIUM · sustainability] Roles page hardcodes the permission catalog and imports an unused fetch hook

**File:** `web/src/app/dashboard/roles/page.tsx` — `8, 15-39`  
**Dimension:** web-dashboard-pages

**Problem:** `useAvailablePermissions` is imported (line 8) but never called — dead import. Instead the permission universe is hardcoded twice: once as `PERMISSION_GROUPS` (line 15) and again as `ACTION_LABELS` (line 24). The backend already exposes `/permissions` (the unused hook fetches it). This is contract drift waiting to happen: when the API adds/renames a permission (e.g. a new resource, or `manage-*` vs `create-*`), the matrix silently omits it, so admins can never grant the new permission and existing roles that have it render as blank cells. The duplicated `ACTION_LABELS` map must also be kept in sync by hand.

**Evidence:** `roles/page.tsx:8 imports `useAvailablePermissions` (only occurrence in file per grep), never invoked; PERMISSION_GROUPS/ACTION_LABELS hardcode the list.`

**Fix:** Drive the matrix from `useAvailablePermissions()` data (group by the resource segment of each `verb-resource` string, derive the action label from the verb), or remove the unused import if the hardcoded set is truly authoritative. At minimum, render any selected permission that is not in PERMISSION_GROUPS so existing assignments aren't hidden.

### 33. 🟡 [MEDIUM · bug-risk] useAllX hooks silently truncate at per_page=500, dropping tenant data without warning

**File:** `web/src/hooks/useBranches.ts` — `23-34 (and identical in useCompanies.ts:25-36, useDepartments.ts:24-35, useUsers.ts:54-65, useTeams.ts:23-34)`  
**Dimension:** web-hooks-data

**Problem:** useAllBranches/useAllCompanies/useAllDepartments/useAllUsers/useAllTeams request a single page with params { per_page: 500 } and return only data.data, discarding meta.total and meta.last_page. These hooks feed the option lists in the User access/role-assignment selectors (web/src/app/dashboard/users/page.tsx:129-138, scopeTargetOptions) and the team-member add selector (teams/page.tsx:32 useAllUsers). The backend caps per_page at 500 (UserController::index line 21: min((int) per_page, 500)). Once any tenant exceeds 500 branches/departments/users, records beyond the first 500 silently vanish from the selectors: an admin assigning a company/branch/department scope or adding a team member simply will not see those entities, with zero error or 'load more'. This is a latent correctness bug that only manifests at scale and is effectively invisible until someone notices an entity is missing.

**Evidence:** `const { data } = await apiClient.get<Paginated<Branch>>('/branches', { params: { per_page: 500 } }); return data.data`

**Fix:** Either paginate through all pages (loop until meta.current_page === meta.last_page) inside the queryFn, expose meta so the UI can warn/load-more, or switch these selectors to a server-side search/typeahead endpoint. At minimum, assert on meta.total > data.length and surface a visible warning rather than silently dropping rows.

### 34. 🟡 [MEDIUM · sustainability] No mutation error handling or 401/auth-expiry recovery in the data layer

**File:** `web/src/components/Providers.tsx` — `8-18`  
**Dimension:** web-hooks-data

**Problem:** The QueryClient sets defaultOptions.queries = { staleTime: 60s, retry: 1 } but defines no global mutation defaults and no global onError handler (no MutationCache/QueryCache onError). The proxy route (web/src/app/api/v1/[...path]/route.ts:11-13) returns 401 { message: 'Unauthorized' } when the NextAuth session/apiToken is missing or expired; in the client this surfaces only as a generic mutation.isError that each page renders as a hardcoded 'Failed to save.' string (e.g. users/page.tsx:495, departments/page.tsx:146). There is no detection of 401 to trigger re-authentication, no toast, and no extraction of the backend's validation message — so an expired session looks identical to a validation error, and Laravel 422 field errors are thrown away. Every page also re-implements its own ad-hoc isError text, so error UX is inconsistent and the real server message never reaches the user.

**Evidence:** `new QueryClient({ defaultOptions: { queries: { staleTime: 60*1000, retry: 1 } } })  // no mutation defaults, no onError, no 401 handling`

**Fix:** Add a QueryCache/MutationCache onError on the QueryClient that detects 401 (redirect to sign-in / refresh session) and surfaces error.response.data.message for 422s via a shared toast. Centralize error rendering so pages stop hardcoding generic strings. Consider retry: false for mutations explicitly (currently relies on the v5 default of no mutation retry, which is implicit).

### 35. ⚪ [LOW · bug-risk] Role assignment/revocation is audit-logged twice (observer + controller)

**File:** `api/app/Observers/UserRoleAssignmentObserver.php` — `12-41 vs api/app/Http/Controllers/RoleAssignmentController.php:85-89,113-117`  
**Dimension:** authz-policies

**Problem:** UserRoleAssignmentObserver is registered (AppServiceProvider.php:41) and logs ACTION_ROLE_ASSIGNED on created() and ACTION_ROLE_REVOKED on deleted(). RoleAssignmentController::store() and destroy() ALSO log the identical actions manually (lines 85-89 and 113-117). Every assignment therefore produces two audit-log rows, and every revocation produces two — with slightly different payloads (the observer adds 'assigned_to', the controller does not), making the audit trail noisy and internally inconsistent. For an auth system whose audit log is a security control, duplicate/divergent entries undermine forensic reliability and inflate storage.

**Evidence:** `Observer created(): app(AuditLogger::class)->log(AuditLog::ACTION_ROLE_ASSIGNED, $target, [...]);  AND  Controller store(): $this->audit->log(AuditLog::ACTION_ROLE_ASSIGNED, $user, [...]);`

**Fix:** Pick one source of truth. Since the observer fires for ALL creation paths (including $user->roleAssignments()->create in the controller), remove the manual ->audit->log() calls from the controller's store()/destroy() and keep only the observer, or vice versa. Ensure the chosen path captures the actor/assigned_by context.

### 36. ⚪ [LOW · bug-risk] actorMaxLevel/level checks read Spatie flat roles, which lag behind scoped assignments

**File:** `api/app/Http/Controllers/RoleAssignmentController.php` — `144,163-170 vs 125-137`  
**Dimension:** authz-policies

**Problem:** assertCanGrantRole() and actorMaxLevel() use $actor->hasAnyRole(...) and $actor->getRoleNames() (Spatie's flat user_has_roles table). That table is only kept in sync with the scoped UserRoleAssignment model by syncSpatieRoles(), which runs after assignment changes. But the flat roles are a UNION of ALL of a user's scoped assignments regardless of scope — so an actor who only holds 'company-admin' scoped to one company is treated, for level purposes, as company-admin everywhere. Combined with assertScopeAccess (which IS scope-aware) the two checks operate on different privilege models, so the effective ceiling is the actor's globally-highest role even when assigning within a scope where they hold a much weaker role. This makes the escalation guard weaker than it appears and is easy to mis-reason about during future changes.

**Evidence:** `$levels = $actor->getRoleNames()->map(fn ($name) => self::ROLE_LEVELS[$name] ?? self::DEFAULT_CUSTOM_LEVEL)->toArray(); return max($levels);`

**Fix:** Compute the actor's max level from the scoped assignments relevant to the target scope (filter roleAssignments by the scope being granted), not from the flat getRoleNames(). At minimum document that level is global-max and ensure assertScopeAccess fully compensates.

### 37. ⚪ [LOW · cleanliness] EnsureUserIsActive and BasePolicy::before duplicate the is_active gate inconsistently; policy returns false (not 403)

**File:** `api/app/Http/Middleware/EnsureUserIsActive.php` — `13 vs api/app/Policies/BasePolicy.php:14-16`  
**Dimension:** authz-policies

**Problem:** Two independent is_active gates exist: the user.active middleware (aborts 403 for inactive users) and BasePolicy::before (returns false for inactive users). The middleware is applied to all protected routes, so the policy check is effectively dead in the HTTP path, but it would matter for any direct Gate::allows() / authorize() call outside a gated route (e.g. queued jobs, console). The two also produce different outcomes: middleware = explicit 403 with message; policy before() returning false short-circuits ALL abilities including viewAny (which otherwise returns true unconditionally), so an inactive user evaluated only through the policy is denied even read — fine, but the redundancy means a future change to one gate won't be reflected in the other, risking divergence (e.g. someone relaxes the policy and forgets the middleware or vice versa).

**Evidence:** `Middleware: if (!$request->user()?->is_active) { abort(403, ...); }  Policy before(): if (!$user->is_active) { return false; }`

**Fix:** Keep a single source of truth for the active-user gate. If the middleware is guaranteed on every authenticated route, keep the policy before() check as defense-in-depth but add a comment cross-referencing the middleware so the two stay aligned.

### 38. ⚪ [LOW · bug-risk] index() role-assignment listing authorizes with 'update' but store/destroy use 'assignRoles' — inconsistent gate

**File:** `api/app/Http/Controllers/RoleAssignmentController.php` — `36,48,102`  
**Dimension:** authz-policies

**Problem:** RoleAssignmentController::index() authorizes with $this->authorize('update', $user) (UserPolicy::update — requires update-users/manage-users), while store() and destroy() authorize with 'assignRoles' (requires the distinct 'assign-roles' permission). This means a user who can edit users but lacks assign-roles can LIST another user's role assignments (a sensitive view of their privilege footprint) even though they cannot manage them, and conversely the gate semantics for viewing vs mutating role data are mismatched. Listing privilege data should be gated by the same authorization domain as managing it.

**Evidence:** `index(): $this->authorize('update', $user);  store()/destroy(): $this->authorize('assignRoles', $user);`

**Fix:** Authorize index() with 'assignRoles' (or a dedicated 'viewRoleAssignments' ability) so the ability to see a user's role assignments is governed by the assign-roles permission, consistent with store/destroy.

### 39. ⚪ [LOW · sustainability] viewAny returns true unconditionally on every policy — index authorization relies entirely on the global CompanyScope

**File:** `api/app/Policies/CompanyPolicy.php` — `10-13 (and identical in Branch/Department/Team/User policies)`  
**Dimension:** authz-policies

**Problem:** Every policy's viewAny() hard-returns true, so list/index endpoints perform no policy-level authorization and depend SOLELY on the CompanyScope global scope to filter rows by tenant. This is a leaky abstraction: authorization correctness for all collection endpoints is implicit and off-loaded to a query scope. Any controller that calls Model::withoutGlobalScope(CompanyScope::class) for legitimate reasons (the CLAUDE.md explicitly documents this admin pattern) would expose ALL tenants' rows with no second line of defense, because viewAny already said yes. There is also no permission check (e.g. a plain 'user' role with no permissions can hit GET /users and list everyone in their company).

**Evidence:** `public function viewAny(User $user): bool { return true; }`

**Fix:** At minimum document the invariant that index endpoints MUST keep CompanyScope applied. Consider gating viewAny on a view-* permission or returning a scoped query from the policy/controller so authorization is explicit rather than emergent from the scope.

### 40. ⚪ [LOW · bug-risk] SyncController response declares user.username but the field is never returned (no username column)

**File:** `api/app/Http/Controllers/Auth/SyncController.php` — `58-61`  
**Dimension:** contract-consistency

**Problem:** The frontend contract SyncedUser (web/src/lib/api.ts L6-17) declares `user.username: string` as a required, non-optional field. The backend builds the response with `$user->only(['id','name','email','username','authentik_uid','company_id','is_active'])`. There is no `username` column on the users table (User model fillable at api/app/Models/User.php L25-29 has no username; grep of api/database found no `username` migration), so Eloquent's `only()` silently omits keys that are not real attributes. The response therefore never contains `username`, but TypeScript believes it is always a string. Any code that reads `synced.user.username` gets `undefined` at runtime while the type system asserts it is present — a silent contract mismatch. (auth.ts currently does not read it, so impact is latent, but the type is a lie.)

**Evidence:** `Backend: `$user->only(['id', 'name', 'email', 'username', 'authentik_uid', 'company_id', 'is_active'])` — `username` not a column. Frontend: `user: { ... username: string ... }``

**Fix:** Pick one: either drop `username` from SyncedUser (the frontend already has the username from authentikUser.username before calling sync), or have SyncController explicitly include it, e.g. add `'username' => $data['username']` to the returned array since it is already validated in the request payload.

### 41. ⚪ [LOW · bug-risk] User.roles is populated by index but omitted by store/update responses

**File:** `api/app/Http/Resources/UserResource.php` — `23`  
**Dimension:** contract-consistency

**Problem:** UserResource exposes `roles` via `$this->whenLoaded('roles', ...)`. UserController::index eager-loads `roles` (UserController.php L24 `User::with('roles', 'roleAssignments.role')`), so list responses contain `roles`. But store (L47) and update (L77) only load `roleAssignments.role`, never `roles`, so the create/update single-resource responses omit the `roles` key entirely. The frontend User type marks `roles?: string[]` optional, and the users table reads `user.roles?.length` (web/src/app/dashboard/users/page.tsx L627). Because the mutations invalidate the `['users']` list query, the table re-fetches and the field reappears — so today it self-heals. But any code that consumes the direct create/update response (e.g. optimistic update or reading the returned single user's roles) will see `roles` missing right after a mutation. This is inconsistent serialization of the same Resource across endpoints.

**Evidence:** `index: `User::with('roles', 'roleAssignments.role')`; store/update: `$user->...->load('roleAssignments.role')` (no 'roles'). Resource: `'roles' => $this->whenLoaded('roles', ...)``

**Fix:** Eager-load `roles` consistently in store/update (`->load('roles', 'roleAssignments.role')`) so the same Resource returns the same shape from every endpoint, or document that single-resource responses never include `roles` and have the frontend never depend on it.

### 42. ⚪ [LOW · cleanliness] /me endpoint returns a role_assignments shape inconsistent with the RoleAssignment contract used elsewhere

**File:** `api/routes/api.php` — `66-71`  
**Dimension:** contract-consistency

**Problem:** The inline /me handler hand-builds role_assignments as `{ id, role, scope_type, scope_id }`, omitting `role_id`, `assigned_by`, and `created_at`. The canonical RoleAssignmentResource (api/app/Http/Resources/RoleAssignmentResource.php) and the frontend RoleAssignment type (web/src/types/models.ts L11-19) include all of those fields as required. Today this is harmless because /me is consumed only by fetchUserProfile -> UserProfile (web/src/lib/api.ts L19-29), and UserProfile deliberately does NOT include role_assignments. But the divergent hand-rolled shape duplicates serialization logic that already exists in RoleAssignmentResource and is a future trap: if anyone starts reading role_assignments off the /me payload using the RoleAssignment type, they will get objects missing 3 required fields.

**Evidence:** `/me: `'role_assignments' => $user->roleAssignments->map(fn ($a) => ['id'=>$a->id,'role'=>$a->role->name,'scope_type'=>$a->scope_type,'scope_id'=>$a->scope_id])`  vs RoleAssignmentResource which adds role_id, assigned_by, created_at`

**Fix:** Reuse `RoleAssignmentResource::collection($user->roleAssignments)` in the /me handler so there is a single source of truth for the role-assignment shape, eliminating the divergence.

### 43. ⚪ [LOW · sustainability] Heavy CRUD duplication across five controllers and their FormRequests

**File:** `api/app/Http/Controllers/BranchController.php` — `whole file; identical pattern in DepartmentController, TeamController, CompanyController, partially UserController`  
**Dimension:** controllers-requests

**Problem:** BranchController, DepartmentController, TeamController and CompanyController are near-identical: same authorize() calls, same `min((int) request()->integer('per_page',20),500)` pagination snippet copy-pasted (TeamController even diverges with a hard-coded paginate(20)), same array_merge(['is_active'=>true], validated()) create idiom, same noContent() destroy. The Store/Update FormRequests likewise repeat the same name/code/is_active rule blocks. This duplication means every cross-cutting change (default per_page, max per_page, audit logging on create/update/delete, soft-delete handling) must be made in 4-5 places and will drift — TeamController already has.

**Evidence:** `$perPage = min((int) request()->integer('per_page', 20), 500); repeated verbatim in BranchController:18, DepartmentController:18, CompanyController:22, UserController:21; TeamController instead has Team::paginate(20) with no per_page support.`

**Fix:** Extract the pagination/per_page resolution into a shared trait or base controller method, and centralize the create defaults. Consider a small base CRUD controller or a shared FormRequest trait for the common name/code/is_active rules.

### 44. ⚪ [LOW · cleanliness] Inconsistent response envelopes and success status codes across endpoints

**File:** `api/app/Http/Controllers/TeamMemberController.php` — `46; compare RoleAssignmentController.php:94-97, BranchAccessGrantController.php:48, CompanyController.php:33`  
**Dimension:** controllers-requests

**Problem:** Response shapes and 201 usage are inconsistent. apiResource store() methods (Company/Branch/Department/Team/User) return a bare Resource — Laravel wraps it as {"data":...} with HTTP 200, NOT 201, on create. TeamMemberController::store and RoleAssignmentController::store manually return ['data'=>...] with 201. BranchAccessGrantController/RoleController return ['data'=>...] (RoleController hand-rolls arrays, not Resources) with Response::HTTP_CREATED. So a client cannot rely on either the status code (200 vs 201 on create) or the envelope/serialization being uniform. This is contract drift waiting to break the Next.js client.

**Evidence:** `CompanyController::store returns `new CompanyResource(...)` (200). TeamMemberController::store returns `response()->json(['data'=>new UserResource($user)], 201)`. RoleController::store returns a hand-built array via formatRole(), not a JsonResource.`

**Fix:** Standardize: resource controllers should return `(new XResource($model))->response()->setStatusCode(201)` on create; adopt the {data:...} envelope everywhere (or nowhere) and convert RoleController/BranchAccessGrantController hand-rolled arrays into proper JsonResource classes.

### 45. ⚪ [LOW · sustainability] AuditLogResource label map duplicates AuditLog action constants and will silently fall out of sync

**File:** `api/app/Http/Resources/AuditLogResource.php` — `10-31, 38`  
**Dimension:** controllers-requests

**Problem:** LABELS is a hard-coded string->string map keyed by raw action strings ('auth.local.success', etc.) that mirror AuditLog::ACTION_* constants defined elsewhere. The map is missing several actions actually emitted by controllers — e.g. ACTION_BRANCH_ISOLATION_ON/OFF (CompanyController), ACTION_BRANCH_GRANT_CREATED/REVOKED (BranchAccessGrantController), ACTION_ROLE_CREATED/UPDATED/DELETED (RoleController), and auth.sso.failed has a label but auth.local entries exist while sync success has none. For any unmapped action the UI falls back to the raw machine string (line 38). Because the keys are duplicated literals rather than referencing the constants, every new audit action must be remembered here and there is no compile-time link.

**Evidence:** `private const LABELS = ['auth.sso.failed'=>'SSO login failed', ...]; with no entries for branch.isolation.*, branch.grant.*, role.created/updated/deleted. Fallback: self::LABELS[$this->action] ?? $this->action.`

**Fix:** Drive labels from the AuditLog constants (e.g. a single map on the AuditLog model keyed by the constants), or generate the human label from the action programmatically, so adding a constant forces/handles its label in one place.

### 46. ⚪ [LOW · sustainability] AuditLogController re-implements authorization and tenant scoping that belongs in a policy/scope

**File:** `api/app/Http/Controllers/AuditLogController.php` — `14-31`  
**Dimension:** controllers-requests

**Problem:** Unlike every other resource (which uses $this->authorize(...) + policies), AuditLogController hand-rolls its authz: it news up ScopedPermissionService inline, checks hasAnyRole + two permissions, abort(403), then manually applies the company_id filter only for non-super-admins. This bypasses the policy layer entirely, duplicates the super-admin bypass logic that BasePolicy::before already centralizes, and inlines a fully-qualified app(\App\Services\ScopedPermissionService::class) string. If the permission model changes, this controller will silently diverge from the policies. It is also the only place 'manage-company'/'manage-users' umbrella names are checked directly rather than via scopedCanAny.

**Evidence:** `$isSuperAdmin = $actor->hasAnyRole(['super-admin','developer']); ... $sps = app(\App\Services\ScopedPermissionService::class); if (!$sps->can(...'manage-users'...) && !$sps->can(...'manage-company'...)) abort(403); plus manual ->where('company_id', $actor->company_id).`

**Fix:** Introduce an AuditLogPolicy::viewAny (reusing BasePolicy::before for the super-admin bypass and scopedCanAny for the permission check) and call $this->authorize('viewAny', AuditLog::class). Resolve ScopedPermissionService via constructor injection, not an inline app() with a FQCN literal.

### 47. ⚪ [LOW · bug-risk] RoleAssignmentController.actorMaxLevel returns 0 for an actor with no recognized role, but custom roles silently map to a fixed level

**File:** `api/app/Http/Controllers/RoleAssignmentController.php` — `153, 163-170`  
**Dimension:** controllers-requests

**Problem:** Privilege comparison uses a hard-coded ROLE_LEVELS map plus DEFAULT_CUSTOM_LEVEL=30 for anything unrecognized. Two fragile behaviors: (1) any custom role — for the role being granted AND for the actor's own roles — collapses to 30, so an actor whose highest role is a custom role at 30 can grant any other custom role only if its level is strictly below 30, i.e. never (30 >= 30 aborts), while company-admin (70) can grant all custom roles; the hierarchy for custom roles is therefore effectively unconfigurable and arbitrary. (2) actorMaxLevel returns 0 when the actor has no roles, which combined with roleLevel>=actorLevel means a role at level 0 could in principle pass — no role has level 0, so it's latent, but the 0 sentinel is a foot-gun. The whole scheme is magic-number based and lives only in this controller, divorced from the Spatie role definitions.

**Evidence:** `$roleLevel = self::ROLE_LEVELS[$role->name] ?? self::DEFAULT_CUSTOM_LEVEL; $actorLevel = $this->actorMaxLevel($actor); abort_if($roleLevel >= $actorLevel, 403, ...); actorMaxLevel: return !empty($levels) ? max($levels) : 0;`

**Fix:** Persist a privilege/level attribute on the Role model (or a config map referenced in one place) instead of a controller-local constant, so custom roles get explicit levels. Treat 'no recognized role' as the lowest possible privilege explicitly and document that no grantable role may have level 0.

### 48. ⚪ [LOW · sustainability] Three near-identical actorAllowed*Ids helpers duplicate scope-resolution logic also present in CompanyScope

**File:** `api/app/Http/Controllers/RoleAssignmentController.php` — `199-239`  
**Dimension:** controllers-requests

**Problem:** actorAllowedCompanyIds, actorAllowedBranchIds and actorAllowedDepartmentIds are copy-paste variants differing only by the scope_type string and the seed column. The company/branch variants are conceptually the same computation already done in CompanyScope::allowedCompanyIds / allowedBranchIds (which additionally consider CrossTenantGrant / BranchAccessGrant). The controller's version omits those grant sources, so an actor with a cross-tenant grant could be denied scope access here while CompanyScope would allow them visibility — a subtle inconsistency between two copies of 'what can this actor reach'.

**Evidence:** `Three methods each: array_filter([$actor-><col>]) merged with DB::table('user_role_assignments')->where('scope_type',<type>)->pluck('scope_id'). Differs only by 'company'/'branch'/'department' and company_id/branch_id/department_id.`

**Fix:** Collapse into one helper parameterized by scope type + seed column, and ideally delegate to a shared service (the same one CompanyScope uses) so the definition of an actor's reachable scope lives in exactly one place.

### 49. ⚪ [LOW · sustainability] per_page max of 500 (and inconsistent defaults) enables expensive unbounded-ish responses

**File:** `api/app/Http/Controllers/UserController.php` — `21-25`  
**Dimension:** controllers-requests

**Problem:** Index endpoints allow per_page up to 500. UserController eager-loads roles and roleAssignments.role, so a 500-row page pulls a large object graph; combined with the duplicated/divergent pagination code, a client can request 500 fully-hydrated users per page. There is no upper guard tied to payload weight and no consistency: AuditLog hard-codes 50, Team hard-codes 20, the rest cap at 500. This is a scalability/consistency smell rather than a correctness bug.

**Evidence:** `$perPage = min((int) request()->integer('per_page', 20), 500); ... User::with('roles','roleAssignments.role')->paginate($perPage); vs AuditLog paginate(50) and Team paginate(20).`

**Fix:** Centralize a single, lower max page size (e.g. 100) and a single default, applied uniformly across all index endpoints; keep eager-load-heavy resources on the conservative end.

### 50. ⚪ [LOW · sustainability] Soft-delete restore() and forceDelete() produce no audit entries on Branch/Department/Team/Company

**File:** `api/app/Observers/BranchObserver.php` — `9-36 (and DepartmentObserver, TeamObserver, CompanyObserver)`  
**Dimension:** models-observers-services

**Problem:** Branch, Department, Team and Company use SoftDeletes, but their observers only implement created/updated/deleted. There are no restored() or forceDeleted() handlers. Restoring a soft-deleted branch (which re-grants access to all its departments/users) and permanently force-deleting a tenant entity are both high-impact, security-relevant state changes that leave zero trail in audit_logs. The audit model defines no constants for these events either. Given the system's premise that 'all changes are tracked', restore/forceDelete are exactly the privileged operations an auditor would need to see.

**Evidence:** `BranchObserver.php implements only created()/updated()/deleted(); no restored()/forceDeleted(). Same for Department/Team/Company observers.`

**Fix:** Add restored() and forceDeleted() handlers to the soft-deletable observers and corresponding AuditLog action constants (e.g. ACTION_BRANCH_RESTORED). Since all four observers are now identical boilerplate, consider one generic observer parameterized by the action prefix to remove duplication.

### 51. ⚪ [LOW · cleanliness] TeamMember model is an empty stub never used; team membership audit logic is duplicated in the controller instead of an observer

**File:** `api/app/Models/TeamMember.php` — `7-10`  
**Dimension:** models-observers-services

**Problem:** TeamMember is a bare Model with a '//' body and no $table/$fillable/relationships. Team membership is actually managed through the belongsToMany pivot ('team_members') and the model class is never referenced anywhere. Meanwhile, member-add/remove audit logging lives inline in TeamMemberController::store()/destroy() (lines 40-44, 55-59), unlike every other entity whose audit logging is centralized in an observer. This is the one place where audit business logic is duplicated outside the observer pattern, so a future second code path that attaches/detaches members (seeder, bulk import, console command) will silently skip the audit log. The empty TeamMember model is also dead code that misleads readers into thinking membership is a first-class Eloquent entity.

**Evidence:** `TeamMember.php:7-10  class TeamMember extends Model { // }  — never referenced; TeamMemberController.php:40 logs MEMBER_ADDED inline.`

**Fix:** Either delete the unused TeamMember model, or promote it to the real pivot (extend Pivot, set $table='team_members', and move the MEMBER_ADDED/MEMBER_REMOVED audit writes into pivot events / a single service method) so attach/detach auditing cannot be bypassed.

### 52. ⚪ [LOW · bug-risk] AuditLog.created_at is not fillable and relies entirely on the DB useCurrent() default

**File:** `api/app/Models/AuditLog.php` — `10, 49-63`  
**Dimension:** models-observers-services

**Problem:** AuditLog sets $timestamps=false and casts created_at as datetime, but created_at is not in $fillable and AuditLogger never sets it. Timestamping therefore depends solely on the migration's $table->timestamp('created_at')->useCurrent() DB default. This works on MySQL/Postgres/SQLite today, but it is a hidden coupling: any environment or driver that does not honor the column default (or a future switch to inserting via a path that specifies columns explicitly, or bulk insert()) will write NULL/zero timestamps with no error. For an audit table, a wrong-or-missing created_at undermines the entire forensic value. The cast also can't help because no value is ever assigned to cast.

**Evidence:** `AuditLog.php:10  public $timestamps = false;  // created_at absent from $fillable (49-58); set only by migration useCurrent()`

**Fix:** Set created_at explicitly in AuditLogger::log() (e.g. 'created_at' => now()) and add it to $fillable, rather than depending on the DB default for the one timestamp that matters most. This makes the behavior driver-independent and testable.

### 53. ⚪ [LOW · security] Service-token comparison is not constant-time (timing attack on shared secret)

**File:** `api/app/Http/Middleware/ServiceToken.php` — `17`  
**Dimension:** routes-middleware-infra

**Problem:** The shared secret that protects the service-to-service endpoints (auth/sync and auth/local) is compared with a plain `!==` string comparison: `$request->header('X-Service-Token') !== $secret`. PHP's `!==` on strings short-circuits on the first differing byte, leaking timing information. Because this single static secret is the ONLY thing gating the user-provisioning and break-glass login endpoints (both of which mint Sanctum tokens), an attacker who can hit the API directly can theoretically recover the secret via timing analysis and then forge arbitrary user sessions / create super-admins. The throttle (20/min, 5/min) slows but does not eliminate this for a long-lived secret.

**Evidence:** `if (!$secret || $request->header('X-Service-Token') !== $secret) {
    abort(Response::HTTP_UNAUTHORIZED, 'Invalid service token.');
}`

**Fix:** Use a constant-time comparison: `if (!$secret || !is_string($token = $request->header('X-Service-Token')) || !hash_equals($secret, $token))`. Also consider rotating AUTH_SYNC_SECRET periodically and binding it to a request HMAC over the body rather than a static bearer.

### 54. ⚪ [LOW · bug-risk] Failed-login audit listener can crash request handling and never sets company context

**File:** `api/app/Providers/AppServiceProvider.php` — `44-52`  
**Dimension:** routes-middleware-infra

**Problem:** The global `Failed` event listener writes an AuditLog inside the request lifecycle of every failed authentication. Two problems: (1) it does an unconditional `AuditLog::create()` with no try/catch — if the DB write fails (e.g. transient connection error, or audit_logs unavailable) the original auth failure turns into an unhandled 500 instead of a clean 401, i.e. a logging side-effect changes user-facing behavior. (2) It records neither user_id nor company_id, so failed attempts against known accounts are not attributable per-tenant, undermining the security-monitoring purpose stated in the comment. Under Octane the closure also captures `request()` at boot-resolution time, which is fragile across pooled workers.

**Evidence:** `Event::listen(Failed::class, function (Failed $event) {
    AuditLog::create([... 'payload' => ['identifier' => ...], 'ip_address' => request()->ip(), ...]);
});`

**Fix:** Wrap the write in try/catch (log-and-continue), resolve the user from the credentials to populate user_id/company_id when known, and move the closure into a dedicated invokable listener class so it resolves request() per-invocation (Octane-safe).

### 55. ⚪ [LOW · cleanliness] Inline closures in routes/api.php duplicate controller logic and bypass Form Requests / Resources

**File:** `api/routes/api.php` — `47-84`  
**Dimension:** routes-middleware-infra

**Problem:** The `me`, `permissions` routes contain substantial business logic as inline closures: `me` hand-builds a user payload (duplicating fields that UserResource exists for) and instantiates ScopedPermissionService inline; `permissions` queries Spatie\Permission\Models\Permission directly and applies the `manage-` filter inline. This logic is untestable in isolation, cannot be route-cached cleanly (closures in route files block `php artisan route:cache`), and duplicates the role/permission shaping that should live in a controller/resource. The `manage-` exclusion rule (legacy umbrella permissions) is encoded both here and implicitly in RolePermissionSeeder, so the two can drift.

**Evidence:** `Route::get('permissions', function () {
    $perms = \Spatie\Permission\Models\Permission::orderBy('name')->pluck('name')
        ->reject(fn ($p) => str_starts_with($p, 'manage-'))->values();
    return response()->json(['data' => $perms]);
});`

**Fix:** Move these into controller methods (e.g. MeController, PermissionController) using UserResource and a single source of truth for the legacy-permission filter, enabling route caching and unit tests.

### 56. ⚪ [LOW · cleanliness] Duplicated permission lists and role maps in RolePermissionSeeder; companyAdminPerms re-builds an identical array to $all

**File:** `api/database/seeders/RolePermissionSeeder.php` — `25-65`  
**Dimension:** routes-middleware-infra

**Problem:** `$all` and `$companyAdminPerms` are constructed from the exact same array_merge of GRANULAR_* + assign-roles + LEGACY, yet are written out as two separate literals — so any future permission added for company-admin must be remembered in two places. The seeder also mixes granular ('delete-teams') and legacy umbrella ('manage-teams') permissions into the same role grants, and the comment 'branch-manager: ... NOT delete' is contradicted by including 'delete-teams'. The role map embeds magic permission strings inline rather than reusing the GRANULAR_* constants for branch-manager/manager. This is brittle and the legacy-vs-granular dual model invites authorization drift (a policy that checks only one of the pair will mis-evaluate).

**Evidence:** `$all = array_merge(... LEGACY);
$companyAdminPerms = array_merge(... LEGACY); // identical to $all
// 'branch-manager: ... NOT delete' but list contains 'delete-teams'`

**Fix:** Derive $companyAdminPerms = $all (or define one canonical constant), build every role's permission set from the GRANULAR_* constants, and plan a deprecation/removal migration for the LEGACY umbrella permissions so policies check a single vocabulary.

### 57. ⚪ [LOW · bug-risk] Grants are active before their valid_from start date — scopeActive() ignores valid_from

**File:** `api/app/Models/BranchAccessGrant.php` — `38-42`  
**Dimension:** tenant-isolation

**Problem:** scopeActive() filters only on is_active and valid_until (`whereNull(valid_until) OR valid_until >= now`). It never checks valid_from. Both CrossTenantGrant (CrossTenantGrant.php:50-54) and BranchAccessGrant define valid_from columns (cross_tenant_grants even useCurrent()), strongly implying a scheduled window. A grant created with a future valid_from is treated as active immediately, granting cross-tenant read access (via CompanyScope::allowedCompanyIds / allowedBranchIds) and cross-company policy access (BasePolicy::inAllowedCompany) before it is supposed to start. This is a silent over-grant: the data models a time window that the enforcement code does not honor.

**Evidence:** `BranchAccessGrant.php:40-41 `->where('is_active', true)->where(fn($q) => $q->whereNull('valid_until')->orWhere('valid_until','>=',now()))` — no valid_from clause. Same in CrossTenantGrant.php:52-53.`

**Fix:** Add `->where(fn($q) => $q->whereNull('valid_from')->orWhere('valid_from','<=', now()))` to both scopeActive() methods so a grant is only active within [valid_from, valid_until].

### 58. ⚪ [LOW · sustainability] applyBranchFilter relies on lazy-loading $user->company inside the global scope (perf + Octane/state risk)

**File:** `api/app/Models/Scopes/CompanyScope.php` — `82-85`  
**Dimension:** tenant-isolation

**Problem:** Every branch-scoped query triggers `$user->company` which lazy-loads the Company model. CompanyScope.apply runs on essentially every Eloquent query for users/departments, so this executes per-query and per-request. Under Laravel Octane (stated in CLAUDE.md as the runtime) the resolved auth()->user() and its loaded relations persist across requests within a worker; a stale/cached `company` relation (e.g. after enforce_branch_isolation is toggled) can apply the wrong isolation decision. It also adds an N+1-style query to the hot path of the global scope. The scope does multiple uncached DB::table lookups (team_members, user_role_assignments, grants) on every query as well.

**Evidence:** `CompanyScope.php:82 `$company = $user->company;` inside applyBranchFilter, invoked from apply() which runs on every users/departments query; allowedCompanyIds()/allowedBranchIds() each issue their own DB::table + grant queries per call.`

**Fix:** Resolve and memoize the user's allowed company IDs, allowed branch IDs, and the enforce_branch_isolation flag once per request (e.g. cache on the request or a per-request service), rather than re-querying inside the global scope on every query. Read enforce_branch_isolation via a fresh value, not a cached relation.

### 59. ⚪ [LOW · bug-risk] CompanyScope silently no-ops for unauthenticated context and for users with null company_id

**File:** `api/app/Models/Scopes/CompanyScope.php` — `18-20, 46`  
**Dimension:** tenant-isolation

**Problem:** apply() returns early (no filtering) whenever auth()->check() is false. Any query executed outside an authenticated HTTP context — queue jobs, console commands, scheduled tasks, model events, or an Octane warmup — runs UNSCOPED and sees all tenants. This is a leaky abstraction: callers may assume the global scope always protects them, but it is silently disabled off the web guard. Separately, allowedCompanyIds() does `array_filter([$user->company_id])`, so a user whose company_id is null gets an empty allowed-company array; whereIn(company_id, []) yields zero rows (fail-closed for reads, good) but the same null user is treated as 'global' for branch purposes (branch_id null → return early at line 77) and UserPolicy::delete:40-42 grants delete of any null-company target to any user with a company. The null-company_id handling is inconsistent across scope and policies.

**Evidence:** `CompanyScope.php:18 `if (!auth()->check()) { return; }`; line 46 `$ids = array_filter([$user->company_id]);`; UserPolicy.php:40-42 null-company target shortcut.`

**Fix:** For non-web contexts, require callers to explicitly choose a tenant (e.g. forCompany) rather than silently returning all rows; consider failing closed or asserting an explicit 'system' context. Define one canonical rule for null company_id users and apply it consistently in the scope and all policies; add tests for queue/console execution paths.

### 60. ⚪ [LOW · cleanliness] Recursion-avoidance via raw DB::table is duplicated and fragile across scope and policy

**File:** `api/app/Models/Scopes/CompanyScope.php` — `28-32, 49-53, 102-106`  
**Dimension:** tenant-isolation

**Problem:** The pattern 'use \DB::table(...) to avoid recursive CompanyScope' is repeated for team_members and user_role_assignments in CompanyScope and again in BasePolicy::inAllowedCompany (lines 65-69). The grant grantee-matching closure (user OR team) is duplicated four times across CompanyScope.allowedCompanyIds, allowedBranchIds and BasePolicy. This duplication means a future change to grantee matching (e.g. adding a 'role' grantee type) must be edited in multiple places, and the bare \DB facade (root-namespaced) plus implicit reliance on raw queries to dodge the global scope is an easily-broken invariant. If someone later 'tidies' these to use the Eloquent models, recursion or unexpected scoping returns.

**Evidence:** `Duplicated grantee closure in CompanyScope.php:57-66 and 111-120 and BasePolicy.php:73-82; raw \DB::table at CompanyScope.php:29, 49, 102 and DB::table at BasePolicy.php:66.`

**Fix:** Extract a single TenantAccessResolver service that returns allowedCompanyIds/allowedBranchIds/teamIds for a user, used by both the scope and the policies, with the recursion-safe raw queries encapsulated in one place. Import the DB facade properly rather than using the root-namespaced \DB.

### 61. ⚪ [LOW · security] Route protection (proxy.ts matcher) only covers /dashboard and /login; the deleted middleware protected everything by default

**File:** `web/src/proxy.ts` — `23-25`  
**Dimension:** web-auth-proxy

**Problem:** The deleted `web/src/middleware.ts` used `matcher: ['/((?!api/auth|login|_next/static|_next/image|favicon\.ico).*)']` — i.e. it ran `auth` (and thus redirect-on-unauthenticated, via the NextAuth default authorized callback being absent it only injected req.auth, but the matcher was deny-by-default for every non-excluded path). The replacement `proxy.ts` narrows the matcher to only `['/dashboard/:path*', '/login']`. Any NEW authenticated route added outside `/dashboard` (e.g. `/settings`, `/admin`, `/account`) will silently have zero edge-level gate — a classic contract-drift / future-bug trap where adding a page does not add protection. The Next.js 16 proxy docs explicitly warn that 'a matcher change or refactor ... can silently remove Proxy coverage. Always verify authentication and authorization inside each Server Function rather than relying on Proxy alone.' Today the dashboard is independently protected by `auth()` in `dashboard/layout.tsx` (good — that is the real guard), so this is not currently exploitable, but the narrow matcher is fragile.

**Evidence:** `export const config = { matcher: ['/dashboard/:path*', '/login'] }  // old: matcher excluded only api/auth|login|_next|favicon`

**Fix:** Either keep a deny-by-default matcher (exclude only public assets + /login + /api/auth, like the old middleware) so new private routes inherit protection, or document clearly that every private route group MUST have its own server-side `auth()` guard in a layout. Do not rely on the proxy as the sole gate; the proxy is best-effort UX redirect only.

### 62. ⚪ [LOW · bug-risk] Proxy hardcodes Content-Type: application/json and drops all other request/response headers, silently breaking non-JSON traffic

**File:** `web/src/app/api/v1/[...path]/route.ts` — `26-46`  
**Dimension:** web-auth-proxy

**Problem:** The proxy forwards exactly three request headers and hardcodes `'Content-Type': 'application/json'`. Any future file upload (multipart/form-data), CSV export, or binary download through `/api/v1/...` will break: outbound multipart bodies will be mislabeled as JSON (Laravel will fail to parse the upload), and inbound responses only copy `Content-Type` — `Content-Disposition`, `Content-Length`, pagination headers, rate-limit headers, etc. are all dropped. The request body is also read with `req.text()` (line 23), which corrupts binary payloads. This is a latent contract-drift bug: the proxy works only for the current JSON-only API and will fail the first time a binary endpoint is added, with confusing symptoms.

**Evidence:** `headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${session.apiToken}` }`

**Fix:** Forward the inbound `Content-Type` (`req.headers.get('content-type')`) instead of hardcoding it, stream the body with `req.body`/`arrayBuffer()` rather than `text()`, and copy a safe allowlist of upstream response headers (Content-Type, Content-Disposition, Content-Length, Cache-Control). At minimum add a code comment that the proxy is JSON-only by design.

### 63. ⚪ [LOW · bug-risk] Login provider selection silently downgrades to SSO when ALLOW_LOCAL_AUTH is off, and uses '@' as the local/SSO discriminator

**File:** `web/src/app/login/_components/LoginForm.tsx` — `88-93`  
**Dimension:** web-auth-proxy

**Problem:** `const provider = isEmail && allowLocalAuth ? 'local' : 'sso'` routes any identifier containing '@' to local auth only when `allowLocalAuth` is true; otherwise an email-shaped identifier is sent to the SSO (Authentik) provider as a `username`. If a deployment's Authentik uses email as the uid_field this is fine, but if it does not, every email login silently fails as 'incorrect password' with no indication that the wrong provider was chosen. The '@'-in-string heuristic is also brittle (usernames can contain '@', emails can be entered without realizing local auth is disabled). This is a maintainability/UX fragility, not a vuln, but it produces confusing silent failures.

**Evidence:** `const isEmail = data.identifier.includes('@'); const provider = isEmail && allowLocalAuth ? 'local' : 'sso'`

**Fix:** Make provider selection explicit (a toggle or separate buttons for SSO vs break-glass local), or drive it from server-configured policy rather than a client-side string heuristic. At minimum, surface a distinct error when local auth is attempted while ALLOW_LOCAL_AUTH is false.

### 64. ⚪ [LOW · cleanliness] Three near-identical token-fetch helpers duplicate fetch/error-swallowing logic with diverging silent-failure behavior

**File:** `web/src/lib/api.ts` — `31-74`  
**Dimension:** web-auth-proxy

**Problem:** `fetchUserProfile`, `syncUserToLaravel` (api.ts) and `authenticateLocally` (local-auth.ts) all repeat the same pattern: read `API_URL`/`SYNC_SECRET`, build a fetch with the same headers, `try { if (!res.ok) return null; return res.json() } catch { return null }`. The blanket `catch { return null }` swallows every error (network, JSON parse, 5xx) into an indistinguishable `null`, which then propagates into the auth flow as 'invalid credentials' or 'empty roles' (see the roles finding). This duplication plus uniform silent-null is a maintainability and debuggability hazard: a misconfigured `API_URL` looks identical to a wrong password.

**Evidence:** `if (!res.ok) return null; return res.json() ... } catch { return null }  // repeated in fetchUserProfile, syncUserToLaravel, authenticateLocally`

**Fix:** Extract a single `serviceFetch(path, init)` helper that centralizes base URL, service-token header, and error handling, and distinguish 'auth failed' (401/403) from 'service unavailable/parse error' so the login UI and logs can tell them apart. Log the swallowed errors server-side.

### 65. ⚪ [LOW · bug-risk] Unreachable 'locked' state — dead code and a broken/false UX promise

**File:** `web/src/app/login/_components/LoginForm.tsx` — `12, 24-28, 114`  
**Dimension:** web-components-ui

**Problem:** `State` includes 'locked', BANNERS defines a 'locked' message ('Account locked after 5 failed attempts...'), and `passwordError` is computed as `state === 'error' || state === 'locked'`. But nothing ever sets state to 'locked': the initializer only produces 'not-in-directory'/'error'/'default', and onSubmit only sets 'loading'/'not-in-directory'/'error'. The lockout banner is therefore unreachable dead code, and worse it advertises a security control ('locked after 5 failed attempts') that the frontend has no way to surface — if the backend does lock accounts, the user will only ever see the generic 'Email or password incorrect' message, masking the real reason. This is contract drift between the UI's stated behavior and what it can actually display.

**Evidence:** `type State = 'default' | 'loading' | 'error' | 'locked' | 'not-in-directory'  // 'locked' never assigned; BANNERS.locked is dead`

**Fix:** Either wire the lockout state to a real signal from signIn (e.g. map result.error === 'AccountLocked' to setState('locked')) or remove the 'locked' member, its BANNERS entry, and the `|| state === 'locked'` branch to eliminate the misleading dead code.

### 66. ⚪ [LOW · bug-risk] 'Keep me signed in' checkbox and 'Forgot?' button are non-functional fakes

**File:** `web/src/app/login/_components/LoginForm.tsx` — `349-358, 416-430`  
**Dimension:** web-components-ui

**Problem:** The 'Keep me signed in' control is a <span> styled to look like a checkbox inside a <label> — it has no input, no state, no aria-checked, and is not keyboard-focusable or toggleable; it does nothing. The 'Forgot?' button is a type="button" with no onClick handler, so it silently does nothing when clicked. Both present functionality to the user that does not exist (the checkbox cannot even be checked), which is a UX bug and an accessibility problem (a fake checkbox announces nothing to assistive tech). These will become latent bugs the moment someone assumes 'remember me' actually persists the session.

**Evidence:** `<span style={{ width: 15, height: 15, borderRadius: 4, ... border: '1.5px solid var(--ink-300)' ... }} /> Keep me signed in   // no <input type=checkbox>, no state`

**Fix:** Either implement them (real <input type="checkbox"> wired into signIn options; a Forgot-password link/handler) or remove them until they work. Do not ship interactive-looking elements that have no behavior.

### 67. ⚪ [LOW · bug-risk] Misleading green 'check' icon shown on the email field after any auth failure

**File:** `web/src/app/login/_components/LoginForm.tsx` — `113-115, 332-334`  
**Dimension:** web-components-ui

**Problem:** `showEmailCheck = !emailError && identifierValue.length > 0 && state !== 'default'` drives a green check-circle on the identifier field. After a wrong-password submit (state === 'error'), emailError is false, the field is non-empty, and state !== 'default', so the green 'valid' checkmark appears next to the email even though the credentials were just rejected. It signals 'this is valid' purely because the failure was classified as a password error, which is misleading — the form never actually validated the email against the directory. The signal conflates 'not flagged as a directory error' with 'confirmed valid'.

**Evidence:** `const showEmailCheck = !emailError && identifierValue.length > 0 && state !== 'default'`

**Fix:** Drive the success affordance off an explicit positive signal (e.g. a verified-email response) rather than the absence of a specific error class, or remove the green check entirely since the form does no real-time identifier validation.

### 68. ⚪ [LOW · sustainability] LoginForm is a 500-line monolith mixing layout, brand panel, state machine, and submit logic

**File:** `web/src/app/login/_components/LoginForm.tsx` — `60-500`  
**Dimension:** web-components-ui

**Problem:** A single component renders the full-page layout, two radial glow divs, the entire left brand panel (logo, headline, feature list, contact links), the right form panel, the inline ErrorBanner, the spinner, and the security footer — all in one 440-line return. The decorative brand panel and glows have nothing to do with authentication logic but are inlined here, so the auth-critical onSubmit/state code is buried among ~350 lines of presentational markup. This makes the security-relevant logic hard to review and the component hard to test in isolation.

**Evidence:** `export default function LoginForm(...) { ... return (<main>{/* Radial glows */}...{/* Left — brand panel */}...{/* Right — form panel */}...</main>) }  // single 440-line JSX tree`

**Fix:** Split into `LoginLayout` (glows + brand panel, pure presentation), `LoginCredentialsForm` (the form + onSubmit + state machine), and the existing `ErrorBanner`. The auth logic then lives in a small, testable unit separate from marketing copy.

### 69. ⚪ [LOW · cleanliness] Service catalog data duplicated and inconsistent between AppsSection and AllServicesModal

**File:** `web/src/components/AllServicesModal.tsx` — `9-43`  
**Dimension:** web-components-ui

**Problem:** The list of internal apps exists twice: as the `APPS` tuple array in AppsSection.tsx (lines 7-20) and as the `CATEGORIES` object in AllServicesModal.tsx (lines 9-43), with overlapping but divergent data — e.g. Nextcloud's description is 'Files & collaboration' in AppsSection but 'Files, calendar, contacts' in the modal; ERPNext, Synx, etc. are repeated with their own colors/letters. The modal header also hardcodes '13 internal apps' (line 179) and the footer count is implicit, while the actual CATEGORIES contain 13 items and APPS contains 12 — the numbers will drift the next time someone edits one list and not the other.

**Evidence:** `AppsSection: ['N','#fff','#0082c9','Nextcloud','Files & collaboration']  vs  Modal: { letter:'N', ... name:'Nextcloud', desc:'Files, calendar, contacts' }; modal hardcodes '13 internal apps available'`

**Fix:** Define a single source of truth (one services array with category, letter, colors, name, desc) in a shared module, derive both the carousel and the modal from it, and compute the count (`services.length`) instead of hardcoding '13'.

### 70. ⚪ [LOW · cleanliness] AllServicesModal is not focus-trapped and does not restore focus — keyboard/screen-reader accessibility gap

**File:** `web/src/components/AllServicesModal.tsx` — `74-101, 154-164`  
**Dimension:** web-components-ui

**Problem:** The modal sets role="dialog" aria-modal="true" and handles Escape, but it does not trap focus inside the dialog (Tab can move to background page elements behind the backdrop), does not move focus into the dialog on open, and does not restore focus to the trigger on close. For an aria-modal dialog this is the core requirement; without it, keyboard and screen-reader users can tab 'behind' the modal into inert content. The service cards are also clickable <div>s with onClick handlers (lines 287-298) rather than buttons/links, so they are not keyboard-focusable or actionable.

**Evidence:** `<div role="dialog" aria-modal="true" ...> ... <div ... onClick={...} onMouseEnter={...}>  // div used as interactive item, no focus trap`

**Fix:** On open, focus the dialog (or first focusable element) and trap Tab within it; on close, return focus to the opener. Make each service card a <button>/<a> so it is keyboard-operable, and replace onMouseEnter/Leave inline border swaps with a CSS :hover rule.

### 71. ⚪ [LOW · bug-risk] Sidebar nav gating is inconsistent and shows all items during loading — privilege-aware UI leaks restricted links

**File:** `web/src/components/dashboard/Sidebar.tsx` — `14-35`  
**Dimension:** web-components-ui

**Problem:** NAV_ITEMS gates Companies/Roles/Audit Log behind permissions but leaves Users, Branches, Departments, and Teams completely ungated — any authenticated user sees them, even though the backend has per-resource policies. More importantly, while the session is loading (`isLoading`) the code returns the FULL unfiltered NAV_ITEMS, so on every dashboard load restricted links (Companies, Roles, Audit Log) flash visible for all users until the session resolves. The `requireRoles` branch is also dead — no NAV_ITEM uses it. This is client-side-only gating (defense-in-depth at best), but the loading-state flash plus the ungated items make the nav an unreliable reflection of actual authorization and a source of confusing 403s.

**Evidence:** `const visibleItems = isLoading ? NAV_ITEMS : NAV_ITEMS.filter(...)  // shows everything while loading; { label:'Users', href:'/dashboard/users' } has no requirePermission`

**Fix:** Render no gated items (or a skeleton) while isLoading rather than the full list; add explicit requirePermission to Users/Branches/Departments/Teams to match backend policies; and either use or remove the unused requireRoles field. Never rely on this for security — keep it consistent with server checks to avoid dead 403 links.

### 72. ⚪ [LOW · cleanliness] Dashboard uses a separate dark slate/indigo palette unconnected to the Porti CSS token system

**File:** `web/src/app/globals.css` — `39-42`  
**Dimension:** web-components-ui

**Problem:** The dashboard components (Sidebar, Pagination) are styled entirely with Tailwind's built-in slate-800/indigo-600 dark palette, while the rest of the app (landing, login, modal) uses the bespoke `--purple-*`, `--ink-*`, `--paper`/`--card` light token system. globals.css even carries a '/* Legacy (used by dashboard) */' block (--background:#ffffff/--foreground:#171717) that the dashboard does not actually consume. The result is two parallel, unreconciled design systems and a token block labeled 'legacy' that is effectively dead. This guarantees visual drift and forces contributors to learn which palette applies where.

**Evidence:** `/* Legacy (used by dashboard) */ --background: #ffffff; --foreground: #171717;  // dashboard actually uses hardcoded bg-slate-800 / text-indigo-600, not these vars`

**Fix:** Pick one token system. Either bring the dashboard onto the --ink/--purple/--paper tokens (and delete the unused 'legacy' --background/--foreground if nothing reads them) or formally document the dashboard's dark theme as its own token set, but stop maintaining a mislabeled, unused 'legacy' block.

### 73. ⚪ [LOW · cleanliness] Root layout metadata and language contradict the actual product branding

**File:** `web/src/app/layout.tsx` — `16-19`  
**Dimension:** web-components-ui

**Problem:** The root metadata title is 'IT Portal' / description 'IT Management Portal', a generic placeholder, while the product is branded 'Porti' everywhere else and the landing page (page.tsx line 12-16) overrides with a proper 'Porti — COMFAC IT Service Portal' title. The login route has no metadata override, so the login tab will show the stale 'IT Portal' title. This is leftover scaffold text that drifts from the established brand.

**Evidence:** `export const metadata: Metadata = { title: 'IT Portal', description: 'IT Management Portal' }`

**Fix:** Set the root metadata to the real branded default (e.g. title template '%s · Porti', default 'Porti — COMFAC IT Service Portal') so untitled routes like /login inherit correct branding instead of placeholder text.

### 74. ⚪ [LOW · bug-risk] Departments table renders raw branch_id instead of branch name

**File:** `web/src/app/dashboard/departments/page.tsx` — `283-285`  
**Dimension:** web-dashboard-pages

**Problem:** The Branch column in the departments table prints `{dept.branch_id ?? '—'}` — i.e. it shows a bare numeric foreign key (e.g. '7') to the user instead of the branch name. The form already has the branch list available, and the access-profile/company-settings modals elsewhere correctly map ids to names. This is both a UX bug and inconsistent with the rest of the app, which always resolves ids to human-readable labels.

**Evidence:** `departments/page.tsx:284 `{dept.branch_id ?? <span className="text-slate-600">—</span>}``

**Fix:** Look up the branch name from `useAllBranches()` (once it's used per the previous finding) and render `branches.find(b => b.id === dept.branch_id)?.name ?? '—'`, mirroring `scopeLabel` in users/page.tsx.

### 75. ⚪ [LOW · bug-risk] Standalone async click handlers swallow/leak mutation rejections

**File:** `web/src/app/dashboard/companies/page.tsx` — `215-228`  
**Dimension:** web-dashboard-pages

**Problem:** Handlers that are NOT wrapped by react-hook-form's `handleSubmit` — `handleAddGrant` (companies), `handleAdd` (teams members, teams/page.tsx:42; companies has its own), `toggleIsolation` (companies/page.tsx:208), `handleDelete` in every ConfirmDeleteModal, and `handleAdd` in TeamMembersModal — call `await create.mutateAsync(...)` then clear local state, but have no try/catch. On a rejected mutation the `await` throws inside an async onClick, producing an unhandled promise rejection; worse, in `handleAddGrant`/`handleAdd` the state-reset lines after the await never run on error but also the success-path reset is skipped, and for `toggleIsolation` there is no error surface at all (it relies solely on the toggle re-reading `company.enforce_branch_isolation`, which won't change on failure, silently masking the error). The form `onSubmit` paths are fine because RHF catches; these manual handlers are not.

**Evidence:** `companies/page.tsx:215 `async function handleAddGrant() { ... await create.mutateAsync(...) ; setBranchId('') ... }` with no catch; toggleIsolation:208 has no error display.`

**Fix:** Wrap each manual mutateAsync handler in try/catch (or switch to `mutate(payload, { onError })`) and only reset local state in the success branch; surface failures via the existing `*.isError` UI for toggleIsolation too.

### 76. ⚪ [LOW · cleanliness] users/page.tsx is a 711-line file bundling four components and config

**File:** `web/src/app/dashboard/users/page.tsx` — `1-711`  
**Dimension:** web-dashboard-pages

**Problem:** This single client component file contains the page plus `AccessProfileModal`, `AddAssignmentRow`, `UserFormModal`, `SelectField`, `ConfirmDeleteModal`, the zod schema, `SCOPE_CONFIG`/`SCOPE_ORDER` constants and the `scopeLabel` helper. At 711 lines it is hard to navigate, the access-management subsystem (scoped role assignments) is conceptually independent from the user CRUD form, and the leftover empty comment banners (`// ── Helpers ──` at 263 followed immediately by `// ── SelectField ──` with nothing in between) show the file has outgrown its structure.

**Evidence:** `users/page.tsx is 711 lines; empty 'Helpers' banner at line 263-265.`

**Fix:** Split into `users/page.tsx` (table + page shell), `users/_components/UserFormModal.tsx`, `users/_components/AccessProfileModal.tsx` (with AddAssignmentRow + scope config + scopeLabel), and a shared `SelectField`/`ConfirmDeleteModal`. Remove the empty section banners.

### 77. ⚪ [LOW · cleanliness] Modals lack focus trap, Escape-to-close, and focus restoration (a11y)

**File:** `web/src/app/dashboard/users/page.tsx` — `146-245 (pattern repeated in every modal across all pages)`  
**Dimension:** web-dashboard-pages

**Problem:** Every modal is a plain `fixed inset-0` div with an X button. There is no focus trapping, no Escape-key handler, no `role="dialog"`/`aria-modal`, no return-focus-to-trigger on close, and clicking the backdrop does not dismiss. Keyboard and screen-reader users cannot operate or escape these dialogs conventionally, and focus leaks to the page behind the overlay. Because the markup is duplicated across all 7 pages, the defect is system-wide.

**Evidence:** `users/page.tsx:146 `<div className="fixed inset-0 bg-black/60 ...">` with only an X button and no dialog semantics; same in branches:66, teams:51, companies:69, roles:118, departments:71.`

**Fix:** Centralize modals in one `<Modal>` primitive (see duplication finding) built on a headless dialog (e.g. Radix/Headless UI) or implement role=dialog + aria-modal + Escape listener + focus trap once.

### 78. ⚪ [LOW · bug-risk] List queries do not keep previous data, causing full table unmount on page change

**File:** `web/src/app/dashboard/branches/page.tsx` — `204, 229`  
**Dimension:** web-dashboard-pages

**Problem:** Every list page renders `{data && (...table + Pagination...)}` and the paginated query (`useBranches(page)` etc.) keys on `['branches', page]` with no `placeholderData: keepPreviousData`. When the user clicks Next, `data` becomes `undefined` while the new page loads, so the whole table and the Pagination control unmount and the page jumps to the 'Loading…' line, then remount — a jarring flicker and loss of scroll position on every page change. The Pagination buttons also briefly disappear, making rapid paging awkward.

**Evidence:** `useBranches in useBranches.ts:11-21 has no placeholderData; page renders behind `{data && (...)}` at branches/page.tsx:229 so undefined data unmounts the table.`

**Fix:** Add `placeholderData: keepPreviousData` (TanStack Query v5) to the paginated `useQuery` hooks (useUsers/useBranches/useDepartments/useTeams/useCompanies/useAuditLogs), and optionally show a subtle `isFetching` indicator instead of unmounting.

### 79. ⚪ [LOW · cleanliness] Branch access grant grantee shown as 'user #12' instead of a name

**File:** `web/src/app/dashboard/companies/page.tsx` — `299-307`  
**Dimension:** web-dashboard-pages

**Problem:** In CompanySettingsModal the existing-grants list renders the grantee as `{g.grantee_type} #{g.grantee_id}` (e.g. 'user #12'). The component already has `companyUsers` and `companyTeams` loaded (and uses them to build `granteeOptions` with full names just below), so it could resolve the id to a name. Showing a bare id to an admin reviewing who has cross-branch access is poor for an audit-sensitive screen and inconsistent with the named dropdown directly beneath it.

**Evidence:** `companies/page.tsx:301 `<span className="capitalize text-slate-400">{g.grantee_type} #{g.grantee_id}</span>``

**Fix:** Resolve the grantee name from the already-loaded `companyUsers`/`companyTeams` by `grantee_type` + `grantee_id`, falling back to `#id` only if not found.

### 80. ⚪ [LOW · cleanliness] Mutation functions return the raw AxiosResponse instead of the unwrapped payload, breaking the query/mutation data contract

**File:** `web/src/hooks/useUsers.ts` — `30-34 (pattern repeated in every mutation across useBranches/useCompanies/useDepartments/useTeams/useRoles/useRoleAssignments/useTeamMembers/useBranchAccessGrants)`  
**Dimension:** web-hooks-data

**Problem:** Queries consistently unwrap the Axios envelope (await apiClient.get(...); return data / data.data), but every mutation returns the apiClient.post/patch/delete call directly, i.e. a Promise<AxiosResponse<Single<T>>>. The Single<T>/Paginated<T> generic on these mutation calls is therefore misleading: mutation.data is the full AxiosResponse (status, headers, config, and .data is the body), not the model. Any caller that reads useCreateBranch().mutateAsync(...) expecting a Branch gets an AxiosResponse instead. Today callers only await for side effects so the bug is dormant, but the type annotation actively lies about the shape and the first consumer that reads the result will hit a runtime/shape mismatch.

**Evidence:** `mutationFn: (payload: UserPayload) => apiClient.post<Single<User>>('/users', payload),  // returns AxiosResponse, not User`

**Fix:** Unwrap in the mutationFn the same way queries do, e.g. mutationFn: async (payload) => (await apiClient.post<Single<User>>('/users', payload)).data.data, and type the mutation's TData accordingly. Apply uniformly across all mutation hooks so queries and mutations share one envelope-unwrapping convention.

### 81. ⚪ [LOW · sustainability] Query keys and endpoint URLs are bare string literals duplicated across 11 hook files with no central registry

**File:** `web/src/hooks/useUsers.ts` — `18, 33, 42, 50, 57, 72 (and analogous literals throughout web/src/hooks/)`  
**Dimension:** web-hooks-data

**Problem:** Every hook hardcodes both its REST path ('/users', '/branches', `/users/${userId}/role-assignments`, `/companies/${companyId}/branch-access-grants`, `/teams/${teamId}/members`) and its query key (['users', page], ['users', 'all'], ['branch-access-grants', companyId], etc.) as inline literals. There is no shared queryKeys factory or endpoint constant. This is fragile: an invalidateQueries key that drifts by one character (e.g. 'role-assignments' vs 'role_assignments') silently fails to invalidate with no compile-time error, and the same path/key is re-typed in every CRUD hook (useBranches/useCompanies/useDepartments/useTeams are near-identical copies). As the surface grows this guarantees key/path typos and stale-cache bugs that are hard to trace.

**Evidence:** `queryKey: ['users', page] ... onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }) — keys are stringly-typed and re-declared per file`

**Fix:** Introduce a queryKeys factory (e.g. queryKeys.users.list(page), queryKeys.users.all()) and an endpoints map, and a generic createCrudHooks(resource) factory to collapse the five near-identical CRUD modules. This removes the copy-paste and makes invalidation keys typo-proof and refactor-safe.

### 82. ⚪ [LOW · bug-risk] useAuditLogs duplicates param-building logic that lives in the page, and treats falsy filter values as 'unset'

**File:** `web/src/hooks/useAuditLogs.ts` — `14-30`  
**Dimension:** web-hooks-data

**Problem:** Two problems. (1) The query key is keyed on the whole filters object (['audit-logs', filters]) including page, while the params object is rebuilt separately with a different set of guards — the hook supports user_id and target_type but the audit-log page (audit-log/page.tsx:87-90) only ever sends action/from/to, so the hook carries dead filter branches and two divergent notions of 'which filters exist'. (2) The guards use truthiness: `if (rest.user_id) params.user_id = rest.user_id`. user_id === 0 (a falsy but valid id) is silently dropped, and an empty-string action ('') is already excluded — but because the key uses the full filters object, two filter sets that produce identical params (e.g. {user_id: 0} vs {}) get different cache entries, causing redundant fetches. The from/to inputs are raw 'YYYY-MM-DD' strings passed straight through; backend uses whereDate <= to (inclusive), which is correct, but nothing validates from <= to so an inverted range silently returns zero rows with no feedback.

**Evidence:** `if (rest.user_id) params.user_id = rest.user_id  // drops user_id===0
queryKey: ['audit-logs', filters]  // keyed on raw filters, params built separately`

**Fix:** Build the params object once and key the query on the params (not the raw filters): queryKey: ['audit-logs', params]. Use explicit `!== undefined`/`!== ''` checks instead of truthiness so id 0 is preserved, and either drop the unused user_id/target_type fields or wire them into the UI. Optionally validate from <= to and surface a hint when the range is empty.

### 83. ⚪ [LOW · cleanliness] useToggleUserActive is dead code

**File:** `web/src/hooks/useUsers.ts` — `67-74`  
**Dimension:** web-hooks-data

**Problem:** useToggleUserActive is exported but never imported anywhere in web/src (grep confirms the only occurrence is its own definition). It is also just a thin special-case of useUpdateUser (PATCH /users/{id} with { is_active }), so it adds a second mutation hook hitting the same endpoint with its own cache-invalidation path. Dead, redundant code that will rot and mislead future readers about the intended way to toggle a user.

**Evidence:** `export function useToggleUserActive() { ... apiClient.patch<Single<User>>(`/users/${id}`, { is_active }) ... }  // no importers`

**Fix:** Delete useToggleUserActive and use useUpdateUser({ id, payload: { is_active } }) at the call site when the toggle UI is built, or wire the existing hook into the Users page if a dedicated toggle is intended.

### 84. ⚪ [LOW · bug-risk] models.ts RoleAssignment.assigned_by is required but the embedded users-list payload omits it

**File:** `web/src/types/models.ts` — `11-19`  
**Dimension:** web-hooks-data

**Problem:** RoleAssignment types assigned_by, role_id, and created_at as required. The standalone /users/{id}/role-assignments endpoint loads role and assignedBy (RoleAssignmentController::index:38-41) so the full shape is returned. But the embedded form on the users list (UserResource.php:24-26) only loads roleAssignments.role, so assigned_by is omitted via whenLoaded and the field is simply absent on User.role_assignments[]. Likewise the /me endpoint (routes/api.php:66-71) returns role_assignments items with only id/role/scope_type/scope_id — no role_id, assigned_by, or created_at. The type therefore over-promises for these two code paths. It is currently dormant because no component reads assigned_by/created_at off an embedded assignment, but any future code that trusts the type (e.g. a.assigned_by.name) will hit undefined at runtime with no compiler warning.

**Evidence:** `models.ts: assigned_by: { id: number; name: string } | null  // required, but UserResource omits it: 'role_assignments' => whenLoaded('roleAssignments', RoleAssignmentResource::collection(...)) with only .role loaded`

**Fix:** Make assigned_by, role_id, and created_at optional on RoleAssignment (assigned_by?: {...} | null) to match whenLoaded reality, or split into a full RoleAssignment vs an EmbeddedRoleAssignment type so the contract reflects which fields each endpoint actually returns.

## Rejected by verification (not real / overstated)

1. ~~Branch records are never branch-isolated — BRANCH_SCOPED_TABLES omits 'branches' and 'teams'~~ — The asserted high-severity security hole does not exist as described. (1) branches and teams have no branch_id column, so excluding them from a list of branch_id-bearing tables is correct, not a defect — the title misrepresents intended design as a bug. (2) The concrete "relationship loads bypass br

2. ~~Records with null branch_id are visible to every branch-restricted user, even foreign branches~~ — The claim mischaracterizes intended product behavior as a high-severity vulnerability. (1) Company-level isolation is still enforced regardless of branch_id: lines 34-37 always filter by company_id, so a null-branch record is NEVER visible across companies — only across branches WITHIN the same comp

3. ~~user_role_assignments scope_id is fully trusted by both the scope and ScopedPermissionService with no tenant validation~~ — The claim states scope_id is written with no tenant validation and that an arbitrary scope_id can be injected, but RoleAssignmentController::store (line 59) enforces assertScopeAccess() with abort_unless(in_array($scopeId, $allowed), 403) restricting company/branch scope_ids to the actor's own allow

4. ~~BranchAccessGrant store does not verify branch_id or grantee_id belong to the target company~~ — The claim overstates impact. The foreign branch_id never widens visibility because CompanyScope applies an unconditional company_id whereIn BEFORE the branch filter, and the two are AND-combined; records of the foreign branch's company are already excluded, and branch IDs are globally unique PKs tie

5. ~~AuditLog payload is echoed verbatim to clients and can leak whatever a caller logged~~ — There is no actual data leak in the present code. The claim's own description admits the most sensitive case (failed-login email) is super-admin-only, and the remaining concern is explicitly speculative ('as payload content grows over time... no allowlist'). Every existing payload contains only intr

6. ~~scope_type / grantee_type / target_type stored as free-form strings with comment-only constraints~~ — Overstated severity and partly incorrect mechanism. The finding ignores (a) existing Rule::in / 'in:user,team' validation at the actual write sites, and (b) that every reader is fail-closed: ScopedPermissionService::covers() match has default => false, and CompanyScope/BasePolicy match grantee_type 

7. ~~branch_access_grants and cross_tenant_grants ignore the valid_from/valid_until/is_active window at the schema/query layer; valid_from nullable & inconsistent defaults~~ — The finding misidentifies the enforcement layer (claims ScopedPermissionService reads these columns — it does not) and invents a null-window inconsistency that cannot occur because valid_from is never read by any query; both grant models share an identical, consistent scopeActive() that only conside

8. ~~Standalone personal_access_tokens migration risks duplicate-table collision with Sanctum's own migration~~ — The claim's central premise — "Sanctum ships its own personal_access_tokens migration (auto-loaded from the package)" — is factually wrong for the installed Sanctum 4.3.2, which uses publishesMigrations() (publish-only), not loadMigrationsFrom() (auto-load). No duplicate-table collision can occur fr

9. ~~Authentik login treats any 'redirect' flow response as a successful password verification~~ — The asserted high-severity MFA-bypass does not hold: in Authentik, the password stage handing off to an MFA stage returns type:'native' with a new component, not type:'redirect', so this code fails closed (returns null) rather than skipping MFA. The claim inverts the failure mode. Wrong passwords li

10. ~~Type drift between Session.user (companyId: number|null, required) and the session callback (cast to number|null|undefined), causing a wrong 'No company assigned' UI signal~~ — The core mechanism is wrong. The claim says the warning appears for a company-having user "mid-load" and on transient fetch failure. In reality, during load `session` is `undefined`, so `session?.user?.companyId` is `undefined`, and `undefined !== null` is `true`, making `hasCompany` true and HIDING

11. ~~Dashboard 'No company assigned' check is wrong during loading and for undefined~~ — The asserted material defect (warning permanently suppressed for users who genuinely have no company) does not exist. auth.ts session/jwt/authorize callbacks all coalesce companyId to null (`?? null`), so a loaded session always has companyId as number|null, never undefined; thus null !== null is fa

12. ~~Pagination renders one button per page with no cap — O(n) DOM blowup for large datasets~~ — The title materially overstates the issue. It frames this as an "O(n) DOM blowup" / "one button per page with no cap," which is false — the rendered DOM is bounded to ~5 buttons by the filter, as the description itself concedes ("windowing it down to ~5 entries"). What actually exists is a trivial t
