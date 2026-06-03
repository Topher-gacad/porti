# Porti — Platform Architecture

> Status: **locked plan** (planning complete; build in progress).
> Companion docs: [`TICKETING_PLAN.md`](./TICKETING_PLAN.md) (the first bespoke module).
> This document is the single source of truth for the platform shape, multi-company
> tenancy, RBAC, the configurable workflow engine, the form engine, and the build order.

Porti is COMFAC's internal **multi-company** service portal. It is a *platform* that hosts
many tools — native modules (ticketing, leave, attendance, intern hiring/management, project
management, training, KB, community) and external SSO tiles (ERPNext, Nextcloud) — all sharing
one kernel: identity/SSO, scoped RBAC, multi-tenancy, audit, a configurable workflow engine,
notifications, files, and an apps launcher. The mental model is ERPNext's: one framework, many
modules, workflows that apply to any record.

---

## 1. Confirmed product decisions

These three decisions are settled and drive the whole design:

1. **Multiple companies / subsidiaries.** Tenant *records* are isolated per company; tenant
   *configuration* is **global-default + per-company-override**.
2. **Porti owns the org hierarchy outright.** Admins manage Company → Branch → Department →
   Team and user membership inside Porti. **ERPNext is a plain SSO tile** — no HR/data sync.
3. **Build the generic configurable form/submission engine.** Simple "submit → approve → close"
   needs (leave, attendance corrections, access requests) are *configured*, not coded.

---

## 2. Platform shape — modular monolith

One Laravel 13 app, one database, one deployable. Code is split by **namespace + dependency
direction**, enforced by a CI arch test (deptrac/Pest) — **not** a runtime plugin system, and
**not** Composer-split packages (rejected: autoload/provider-ordering overhead, Octane warm-up
footguns for boundaries plain PSR-4 already gives us). `composer.json` already maps `App\ → app/`,
so `App\Core\*` and `App\Modules\*` need **no autoload change**.

```
api/app/
  Core/                  the shared kernel — everything depends INWARD on this
    Tenancy/             CompanyScope, BelongsToCompany, ResolvesAllowedCompanies (shared concern),
                         SharedConfig + ConfigVisibilityScope, ConfigResolver, TenantContext,
                         AdminContextGuard, CrossTenantGrant, BranchAccessGrant
    Authz/               ScopedPermissionService, BasePolicy, the permission registry
    Audit/               AuditLogger, AuditLog
    Workflow/            WorkflowEngine, HasWorkflow, the closed guard registry,
                         workflows / workflow_states / workflow_transitions / workflow_versions /
                         workflow_approvals, WorkflowValidator, publish/activate service
    Notifications/       NotificationService over queued Laravel Notifications (bell + mail)
    Files/               AttachmentService + polymorphic Attachment + streaming controller
    Search/              Searchable contract + SearchService (DB full-text MVP; powers ⌘K)
    Shared/              polymorphic Comment, ActivityEvent, Sequence (Octane-safe numbering)
    Identity/            User, Company, Branch, Department, Team, SSO sync, apps catalog +
                         ModuleRegistry + PortalModule contract + launch broker
  Modules/
    Submissions/         the generic Tier-1 form engine (leave, attendance corrections, ...)
    Ticketing/           the first bespoke module (see TICKETING_PLAN.md)
    Administration/      the control plane (configures the other modules)
    Interns/ Projects/ Training/ ...   (future)
```

**Dependency law:** `Modules → Core` only. `Core` never imports a module. A module never imports
another module's internal models/migrations; cross-module links go through the morph map or a
published Core/module service.

**Module SDK** — adding a module = one thin `ServiceProvider` + declared artifacts the kernel
discovers: routes, a `PortalModule` descriptor (nav/launcher tile), a `ModulePermissions` fragment
(namespaced slugs + which roles get them), `XxxPolicy extends BasePolicy`, the primary record
implements `HasWorkflow` + seeds its default workflow, `*.*` audit constants, and its own
migrations/seeders. **Adding a module needs zero new engine/authz/audit code.**

---

## 3. Multi-tenancy — two axes

This is the heart of the design. There are **two separate tenancy mechanisms**; conflating them
is the most dangerous bug class in the codebase.

### 3a. Record isolation (unchanged) — `CompanyScope` + `BelongsToCompany`

Tenant *records* (tickets, submissions, users, branches, …) use the `BelongsToCompany` trait,
which attaches `CompanyScope` (auto-filters every query to the actor's allowed company ids and
auto-stamps `company_id` on create) and the `forCompany()` escape hatch. Super-admin/developer
bypass. Cross-tenant reads via `CrossTenantGrant` / `BranchAccessGrant`. **This path is untouched
by the multi-company refinement** — the only change is extracting its `allowedCompanyIds()` helper
into a shared `ResolvesAllowedCompanies` concern (no behavior change).

### 3b. Config tenancy (new) — `SharedConfig` + `ConfigVisibilityScope`

Config-owning tables (`workflows`, `apps`, `sla_policies`, `request_categories`, `form_definitions`)
get a **nullable `company_id`** (NULL = global default available to every company; non-null = that
company's override) + `derived_from_id` (self-FK to the global row it was cloned from). **Children
carry no tenancy** — `workflow_states`/`workflow_transitions`/`workflow_versions` inherit their
parent workflow's `company_id`; form fields live in `form_definitions.field_schema` JSON.

These tables use a **new `App\Core\Tenancy\SharedConfig` trait** attaching `ConfigVisibilityScope`
— **not `BelongsToCompany`**, because (a) `BelongsToCompany`'s `creating` hook auto-stamps the
actor's `company_id`, making a NULL global default *impossible to author*, and (b) branching the
security-critical `CompanyScope` per-model risks a NULL-leak in the strict record path.

```
ConfigVisibilityScope::apply(builder, model):
  if !auth()->check(): return
  if user->hasAnyRole(['super-admin','developer']): return     // devs author globals
  builder->where(fn q =>
    q->whereNull(table.'.company_id')                           // global defaults: visible to all
     ->orWhereIn(table.'.company_id', allowedCompanyIds(user))) // own/granted overrides only
```

`allowedCompanyIds()` is the **same** shared concern `CompanyScope` uses — they must never drift.
`SharedConfig` has **no auto-stamp hook**; `company_id` is set explicitly by the clone action or
left NULL by developers. Escape hatches: `globalDefaults()`, `forCompanyConfig($id)`,
`withoutGlobalScope(ConfigVisibilityScope::class)`.

### 3c. Resolution vs visibility (the subtlest rule)

- `ConfigVisibilityScope` governs what an admin **browses**.
- `ConfigResolver` governs what the engine **uses** for a given record. It runs **scope-OFF**
  (`withoutGlobalScope(ConfigVisibilityScope)`) and takes the **record's** company, not the actor's:

```
ConfigResolver::resolve(domainKey, companyId):
  1. active row WHERE company_id = companyId   → use it
  2. else active row WHERE company_id IS NULL   → use it
  3. else null → 422 at the call site (never silent)
```

Running engine resolution *through* the visibility scope would pick up the actor's visibility
instead of the target company's config — **document and feature-test this loudly.**

### 3d. Customize = CLONE (not reference-with-patch)

"Customize for {Company}" deep-clones the global owning row + all children into a new row with
`company_id = C`, `derived_from_id = global.id`, version=draft. The company edits the clone freely;
the global is untouched. **Reset to default** = soft-delete the clone → the resolver falls back to
the global. Clone wins because it composes with the engine's snapshot/version immutability for free,
keeps the category spine + condition registry safe (verbatim copy), and gives bounded, auditable,
diffable edits. (Reference-with-patch is correct only at hundreds-of-tenants scale; Porti is the
opposite regime.)

### 3e. One-active-default-per-scope

Enforced in the **publish/activate service inside a transaction** (deactivate the prior active
in-scope, then activate the new), **not** a DB partial index (not portable to the in-memory SQLite
test DB; both MySQL and SQLite treat multiple NULLs as distinct in a UNIQUE index). The resolver
orders `is_active desc, version desc` as a deterministic backstop. Feature-tested.

---

## 4. RBAC

- **Namespaced permissions:** `module.action[.qualifier]` (`tickets.approve`, `submissions.approve`,
  `attendance.correction.approve`, `manage-workflows`). `.all` widens *ownership* (not tenancy —
  `CompanyScope` still filters). `.manage` is the module-admin catch-all and stays out of the
  hand-assignable `GET /permissions` list.
- **Scope lives on the assignment, never the slug.** `UserRoleAssignment{scope_type, scope_id}` +
  `ScopedPermissionService::can(user, perm, {company_id, branch_id, department_id})`. A
  "per-company role" is just a global role assigned at `scope_type=company`.
- **Roles:** ~6 global spine roles (`super-admin`, `developer`, `company-admin`, `branch-manager`,
  `manager`, `user`) + thin per-module functional roles (`tickets.agent`, `recruiter`, `instructor`)
  + a system `intern`. **No `company_id` on the `roles` table** — avoids Spatie teams mode and
  preserves the "scope on the assignment" invariant. Custom roles created via `RoleController`
  default to level 30 (below branch-manager) so they can't out-rank the spine.
- **Structural payoff:** `ScopedPermissionService::scopeMatches()` requires a non-null `scope_id`,
  so a company-scoped grant **can never match a `NULL` (global) config row** → company-admins are
  locked out of editing global defaults **with zero new code**; only `BasePolicy::before()`
  (super-admin/developer) reaches globals.
- **Config write authz:** `ConfigPolicy extends BasePolicy`; editing a global → privileged only;
  editing company X's override → that company's admin (`scopedCan('manage-<surface>', {company_id:X})`).
- **Registration:** `RolePermissionSeeder` is an orchestrator looping per-module `ModulePermissions`
  fragments — adding a module never edits the orchestrator.
- **Anti-escalation:** `RoleController::assertPermissionsWithinActorScope` becomes
  company-context-aware (grantable set = the actor's permissions *for the active company*);
  `RoleAssignmentGuard` already blocks cross-company scope grants; surfaced in the UI as disabled
  lock cells. `CrossTenantGrant` creation tightens to super-admin/developer only.

---

## 5. Configurable workflow engine

Entity-agnostic. Any model implementing `HasWorkflow` (`workflowEntityType(): string`,
`workflowContext(): {company_id, branch_id, department_id}`) gets a configurable lifecycle.

- **States/transitions/gates are DATA** in `workflows` / `workflow_states` / `workflow_transitions`
  (+ `workflow_versions`, `workflow_approvals`), seeded with a canonical default per `entity_type`.
  The engine reads rows, never a hardcoded `match()`.
- **Every state declares a fixed `category`** (the status spine per `entity_type`, e.g. tickets:
  `pending/in_progress/resolved/cancelled`; submissions: `open/in_progress/resolved/closed/cancelled`).
  UI/SLA/reporting key off the category, never the free-form state name — **"states are labels,
  categories are truth."** State flags: `is_initial`, `is_terminal`, `sla_pauses`, `is_approval_gate`.
- **Approval is a gate, not a status:** an `is_approval_gate` state opens a `workflow_approvals`
  row; "awaiting approval" is derived from a pending row.
- **Per-transition gating:** `required_permission` (a namespaced slug) + `scope_level`
  (dept/branch/company/global) + optional `allowed_role_names` + `prevent_self` + `requires_comment`
  + an optional `condition` (a key into a **closed, code-reviewed guard registry — never eval**).
  The gate is `ScopedPermissionService::can(actor, required_permission, record.context narrowed to
  scope_level)` + `BasePolicy::before()` bypass.
- **Versioning:** draft → publish → snapshot. Publishing freezes a `graph_snapshot` and pins
  `workflow_version_id` onto each record at creation; in-flight records finish on their version.
- **Resolution** (with multi-company): `entity_type` (+ `subject_type`) → **company tier
  (specific-else-global)** → published active version → snapshot onto the record.
- **Audit:** every transition writes the user-facing `activity_events` timeline **and**
  `AuditLogger->log()` (compliance).

The four guarantees — fixed category spine, closed condition registry, draft→publish→snapshot
version pinning, scoped-permission gating — are **invariant**.

---

## 6. Form / submission engine (Tier-1)

ONE shared `submissions` table (tenant data, `BelongsToCompany`) + ONE `submission` workflow
`entity_type` + per-company `form_definitions` config. **A new request type = a `form_definitions`
row + a `workflows` row in one admin transaction. Zero new code/tables/migrations per type.**

- **`submissions`** (records): `number` (per-company sequence), `company_id`, denormalised
  `branch_id`/`department_id`, `form_definition_id` + `form_definition_version` (snapshot),
  `entity_type='submission'`, `requester_id`, `state` + `state_category`, `data` JSON (typed,
  validated against the snapshotted schema — **not EAV**), `assignee_id`/`assigned_team_id`,
  `workflow_version_id`, timestamps. Cross-cutting bits use the **kernel Shared polymorphic tables**
  (`comments`, `attachments`, `activity_events`, `workflow_approvals`) — not bespoke children.
- **`form_definitions`** (config, `SharedConfig`): `key`, `company_id`, `name`/`icon`,
  `field_schema` JSON (ordered fields from a **closed field-type registry**: text, textarea,
  number, integer, date, datetime, boolean, select, multiselect, radio, user, team, file, currency,
  duration), `workflow_key` (the bound workflow), `naming_series`, `version`, `status`,
  `derived_from_id`.
- **Binding:** ONE `submission` entity_type + per-form `workflow_key` (the engine already supports
  many workflows per entity_type) — **not** entity-type-per-form (which would force a new category
  spine per form and break zero-code).
- **Approver slugs stay coarse** (`submissions.approve[.qualifier]`); differentiate *who* by
  `allowed_role_names` + `scope_level`, never a slug per form.
- **Form-vs-module litmus:** if an admin can fully describe it as *fields + an approval chain*, it's
  a form. If the value is in SLA/triage/routing/aggregation machinery, it's a bespoke module.
  **Ticketing stays bespoke (Tier-2-lite); PM/training/intern stay bespoke.**

---

## 7. Administration control plane

One dedicated **Administration** area (top-nav tab → `/dashboard/admin/*`, gated by `manage-admin`),
a Core control plane that configures the other modules. ERPNext-style separation into clusters:

- **Users & Permissions** — Roles & Permissions (per-module permission matrix), Role Assignments
  (scoped), Apps & Module Access, Access Grants.
- **Build** — **Workflow Studio** (workflows list → States grid + Transitions grid +
  "who-can-do-this" popover + read-only graph + draft/publish/version), **Catalog & Forms** (the
  form builder).
- **Settings** — SLA Policies, Notification Templates *(deferred)*, Audit Log.
- **Organization** *(super-admin)* — Companies (create/edit subsidiaries).

Every Build/Settings surface carries a **company-context switcher**: super-admin/developer pick
"Global defaults" or a company; a company-admin sees a locked "Administering: {Company}". Each row
renders one of three states via a shared `<ConfigScopeBadge>`/`<CustomizeButton>`: *Global default
(inherited)* [Customize] · *Customized for {Company}* [Revert] · *Global default* (privileged,
"affects every company"). An `AdminContextGuard` (route-group middleware) validates the
`X-Admin-Context` header against the actor's allowed companies on **every config write**.

**Dev-vs-admin AND global-vs-override boundary:** developers define *primitives* (the fixed
category enums, the closed condition registry, new permission slugs, new entity_types, the
field-type registry) and author *global defaults*; company-admins **clone-and-edit per-company
overrides only**. Every admin knob validates against a developer-defined closed set.

Reuses existing controllers verbatim: `RoleController` (LOCKED/SYSTEM split + anti-escalation),
`RoleAssignmentController`, `AuditLogController`, `GET /permissions`. **Consolidation:** the legacy
slate-themed `/dashboard/{roles,audit-log}` pages are absorbed and re-skinned into Administration,
then deleted.

---

## 8. Identity & integration

- **Porti owns the org hierarchy.** Companies surface = super-admin only (under Administration);
  Branch/Department/Team management = company-admin (under People → Structure). "Create the box" =
  super-admin; "arrange furniture inside the box" = company-admin.
- **User provisioning, three paths, one company-resolution rule:** (1) admin-invited (pending row
  with the right `company_id`); (2) JIT SSO first login — resolve company by: pre-provisioned email
  match → Authentik attribute/group → `companies.code` → else an "Unassigned users" review queue
  (never silently default a stranger). No auto role-assignment from SSO groups in MVP. (3) local
  break-glass unchanged. On a between-company move, revoke the old company's scoped role assignments.
- **External tools = SSO launcher tiles** in the `apps` catalog (`kind=external_sso`), launched via
  the audited `GET /launch/{key}` redirect broker (Authentik federates; Porti only authorizes +
  audits). **ERPNext's HR feed and the `external_sso_read` kind are DROPPED** — ERPNext is one
  global tile, no data flow. `apps` gets the same `company_id` (NULL = global tile; non-null =
  subsidiary-specific or a per-company override).

---

## 9. Data-model deltas (vs the pre-multi-company plans)

Add `company_id NULL` (FK → companies, `ON DELETE CASCADE`) + `derived_from_id NULL` (self-FK) to
the **owning** config rows; children carry no tenancy:

| Table | Change | Uniqueness |
|---|---|---|
| `workflows` | `+ company_id, derived_from_id` | `unique(entity_type, company_id, slug)` |
| `workflow_states/_transitions/_versions` | none (inherit parent) | `workflow_versions: unique(workflow_id, version)` |
| `apps` | `+ company_id, derived_from_id`; `kind ∈ {native, external_sso}` (drop `external_sso_read`) | `unique(key, company_id)` |
| `sla_policies` | `+ company_id, derived_from_id` | `unique(company_id, type, priority)` |
| `request_categories` | `+ company_id, derived_from_id` | `unique(company_id, slug)` |
| `form_definitions` *(new)* | full table (§6) | `unique(key, company_id, version)` |
| `submissions` *(new)* | tenant data, `BelongsToCompany` (§6) | `unique(company_id, number)` |
| `workflow_versions`, `config_revisions` | as prior plans | — |
| `roles` | **no change** (global-by-name) | — |
| `users` | no new column; `company_id` set by SSO resolution | — |
| `/auth/sync` contract | `+ optional company_code / groups[]` | — |

Migrations are additive; existing `sla_policies`/`request_categories` rows backfill as NULL (they
become the global defaults). **Build the seam day-one** to avoid even that backfill.

---

## 10. Build roadmap

Multi-company **reorders** the build: the config-tenancy seam must exist before any config-owning
table or any record that snapshots config.

- **Phase 0 — Tenancy-config kernel (blocking, day-one).** Relocate `CompanyScope` +
  `BelongsToCompany` into `App\Core\Tenancy`; extract `ResolvesAllowedCompanies`; build
  `SharedConfig` + `ConfigVisibilityScope` + `ConfigResolver` + `AdminContextGuard`. Feature-test
  the three invariants (tenant sees globals + own overrides; never another company's; record path
  leaks nothing).
- **Phase 1 — Org ownership + simplified integration.** Companies surface + People/Structure on
  existing controllers; `SyncController` company-resolution + invite/pending + Unassigned-users
  queue; between-company role revocation; ERPNext/Nextcloud global SSO tiles; `apps.company_id` +
  `/apps` resolution; thin `CrossTenantGrantController`.
- **Phase 2 — Workflow engine** with the company tier baked in from the start; `workflow_versions`,
  `config_revisions`, transactional publish/activate.
- **Phase 3 — Form/submission engine.** `submissions` + `form_definitions` + `FormResolver` +
  `SchemaValidator` + kernel Shared wiring + sequence numbering; ship Leave + Attendance-correction
  global defaults as the proof.
- **Phase 4 — Administration control plane.** Workflow Studio, Catalog & Forms, SLA, Apps, Roles
  matrix — all with the shared company-selector pattern; company-context-aware anti-escalation;
  Access Grants.
- **Phase 5+ — Ticketing** (bespoke Tier-2-lite, per `TICKETING_PLAN.md`), then the heavier modules
  (interns, PM, training), riding the now-complete kernel.

---

## 11. Key decisions (quick reference)

1. **Modular monolith** (not microservices / not split packages); boundaries via arch test.
2. **Config trait = `SharedConfig` + `ConfigVisibilityScope`**, never `BelongsToCompany`.
3. **Customize = clone**, not reference-with-patch.
4. **Roles stay global-by-name**; per-company via `UserRoleAssignment{scope_type:company}`.
5. **Form binding = one `submission` entity_type + per-form `workflow_key`**.
6. **Submission payload = one JSON `data` column** + closed field-type registry (not EAV).
7. **Approval slugs coarse** (`submissions.approve[.qualifier]`); differentiate via roles + scope.
8. **ERPNext = plain SSO tile**; HR feed + `external_sso_read` dropped.
9. **Cross-company grants** = super-admin/developer only; prefer Team-level, time-boxed.
10. **One-active-default** enforced in the publish service (transaction), not a DB partial index.
11. **Workflow conditions = closed registry**, never eval. **Categories are fixed**, states are labels.
12. **Adding a module = data + a fragment + a policy + workflow seed + a tile** — zero engine/authz code.

---

## 12. Module catalog

| Module | Type | Workflow | Tier |
|---|---|---|---|
| IT Ticketing / Service Desk | native | heavy (SLA + approval gates) | Tier-2-lite (bespoke) |
| Leave / HR requests | native | light (1–2 step approval) | Tier-1 (form) |
| Attendance corrections | native | light (1-step) | Tier-1 (form) |
| Intern Hiring / Recruitment | native | medium (multi-stage pipeline) | Tier-1 intake → spawns Tier-2 |
| Intern Management | native | light (onboarding/eval) | Tier-2 (bespoke) |
| Project Management | native | medium (task lifecycle) | Tier-2 (bespoke) |
| Training / E-learning | native | light (enroll/cert) | Tier-2 (bespoke) |
| Knowledge Base | native | light (editorial) | Tier-2-lite |
| Community / Board | native | none (moderation) | Tier-2-lite |
| ERPNext | integration | n/a | global SSO tile |
| Nextcloud | integration | n/a | global SSO tile |
