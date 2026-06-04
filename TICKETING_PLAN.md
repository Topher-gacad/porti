# Porti Ticketing System — Plan

_Planned 2026-06-02. Grounded in the porti design + existing multi-tenant Laravel backend; ITSM/ITIL scaled to ~200 staff._

## Executive summary

Build ONE ticketing entity — a `requests` table (UI synonym "ticket") with a `type` discriminator (ST/SR/AR/CR) — not four engines. The final design proves this: the triage table, "Submitted by me" tab, my-requests card tracker, and dashboard all render the same row shape (id, type, title, priority, status, age, assignee, SLA) and the same four status pills. So one shared lifecycle, with per-type behaviour layered on as (a) an optional approval gate before work begins, (b) per-type/priority SLA targets, and (c) a service-catalog item that pre-templates the request. This is the standard ITIL-4 middle ground for a ~200-seat org: Incident (ST), Request Fulfilment (SR/AR), Change Enablement (CR) in one workspace — like Jira Service Management / Freshservice ship out of the box — without ServiceNow-scale CAB/CMDB/problem/release machinery.

It drops onto the existing backend almost entirely by reuse. `requests` and its children (comments, events, approvals, attachments) get the `BelongsToCompany` trait so `CompanyScope` auto-filters every queue and saved view by tenant and `company_id` auto-stamps on create; super-admin/developer bypass for free. Support groups are existing `Team`s (`team_members` pivot); cross-tenant tech visibility uses the existing `CrossTenantGrant`/`BranchAccessGrant`. Authorization adds one `agent` role + one `change-approver` role + granular `*-requests` permissions to `RolePermissionSeeder`, enforced through the existing `ScopedPermissionService::can()` and a `RequestPolicy extends BasePolicy`. Approvers are derived from scoped roles (manager/branch-manager over the requester's department/branch) — NOT a new manager_id FK, because none exists. Every transition writes through the existing `AuditLogger` with new `request.*` action constants.

Decisive resolution of the cross-dimension conflicts: persist exactly the design's FOUR statuses (pending, in_progress, resolved, cancelled). Model "awaiting approval" as the presence of a pending `request_approvals` row and "awaiting requester" as a `blocked_at` flag that pauses the SLA clock — both are derived/filterable sub-states, never new enum values (this keeps the design's pills intact while still powering the saved views and the dashboard "4 awaiting approval" card). Keep resolved and closed distinct via a `closed_at` timestamp + auto-close window (closed is a terminal sub-state of resolved, not a 5th pill). Track two SLA clocks (response + resolution) with absolute snapshotted due dates, but defer the full holiday-calendar engine — MVP uses a simple business-hours helper. Route automatically to a group/Team, never auto-assign to a person; humans pick up from "Needs triage". Automate the bookkeeping (ack, IDs, SLA timers, status nudges, auto-close, notifications); keep judgment (priority, assignment-to-person, resolve, approve) manual.

## Model & request types

ONE polymorphic `requests` table (Eloquent `Request` model; "ticket" is the UI synonym, and the dashboard counts "open tickets") with a fixed `type` enum discriminator. Per-type behaviour is data-driven via the service catalog + SLA policy + approval rules, not separate tables or separate state machines.

The four request types (final, from the design's Services page and triage table):
- ST — Support Ticket = ITIL Incident. "Something is broken or not working as expected." High-volume lane (design shows 184 of 228). SLA < 4h, avg 1.4h. No approval. Auto-routed to the IT Support group.
- SR — Service Request = ITIL Request Fulfilment. "New software, access, accounts, or onboarding." SLA 1-3d. Most auto-fulfil (password reset, email alias); access-granting catalog items (VPN, GitLab, shared drive) require a manager approval.
- AR — Asset Request = procurement-flavoured Service Request. "Hardware, peripherals, or software licenses." SLA 5-10d. Approval only above a cost threshold (default configurable in config/portal.php); otherwise straight to fulfilment.
- CR — Change Request = ITIL Change Enablement. "Configuration, firewall, DNS, or system changes." SLA 3-5d. ALWAYS requires approval (CAB-lite: one `change-approver`, not a standing board).

Priority is a fixed enum: Critical / High / Medium / Low (design colours: rose/orange/amber/ink). Default Medium on submit; agent sets real priority during triage.

Service catalog (the design's "Pre-templated requests": VPN access, password reset, new laptop, email alias, etc.) is org-wide reference data in `request_categories` — it does NOT use BelongsToCompany. Each catalog item declares: default_type, default_priority, sla_policy, fulfilling_team, requires_approval flag, auto_fulfil flag, and a JSON form_schema for extra fields. The catalog item is the strongest driver of routing, SLA, and the approval gate — keeping per-type differences as data, not code.

## Lifecycle & state machine

CANONICAL STORED STATUS SET = the design's exactly FOUR pills: `pending`, `in_progress`, `resolved`, `cancelled`. This resolves the conflict between the taxonomy proposal (7 statuses) and the design/data-model (4 pills) decisively in favour of the design, which is final. "Awaiting approval" and "awaiting requester" are NOT stored statuses — they are orthogonal, filterable sub-states:
- awaiting_approval = the request has a `pending` row in `request_approvals` (status stays `pending`). Powers the dashboard "4 awaiting approval · 3 access · 1 change" card.
- awaiting_requester = `blocked_at` timestamp is set (status stays `in_progress`). Powers the "Awaiting requester (8)" saved view and PAUSES the SLA clock.
- closed = a terminal sub-state of `resolved`, marked by `closed_at` (kept distinct so "Closed this week (23)" and the reopen window work). The requester's 4-step timeline (Submitted/Triaged/In progress/Resolved) collapses resolved+closed into its final step for friendliness.

Triage is a sub-state of pending, not a status: "Needs triage" = `status=pending AND assigned_team_id IS set AND assignee_id IS NULL` (with `triaged_at` null). Persist `submitted_at, triaged_at, assigned_at, first_responded_at, resolved_at, closed_at, blocked_at` so the timeline, SLA, and metrics read from real columns.

STATE MACHINE (enforced server-side in a `RequestStateMachine`/`RequestService`; illegal jumps return 422; every transition writes a `request_events` row + an `AuditLogger` call):
Base path (all types): pending -> in_progress (triage + assign, or self-pickup) | pending -> cancelled (requester withdraws / triager rejects). in_progress -> resolved | in_progress -> cancelled (duplicate/invalid). resolved -> in_progress (REOPEN, only within a configurable window e.g. 5 business days, or requester rejects resolution) | resolved -> closed (requester confirms, or auto-close after window).
Approval gate (CR always; access-SR; AR over threshold): on submit, the request stays `pending` and a `pending` approval row is created (the awaiting_approval sub-state). Approval -> the gate clears and the request proceeds to triage/pickup (still `pending` until a person/team takes it). Rejection -> request goes to `cancelled` with reason "Approval declined" + mandatory approver comment (NO separate Rejected status — reuse cancelled).
Blocked sub-state: in_progress + set blocked_at (awaiting requester) pauses both SLA clocks; requester reply clears blocked_at and resumes. Auto-nudge at 3 business days of silence; auto-resolve guard at 7 business days (audited as a system action).

WHERE THE GATES SIT: approval gate is AFTER submit, BEFORE a tech is assigned (an unapproved CR/AR must not consume tech time). The approval clock is separate from the resolution SLA, so a slow approver never breaches the IT team's SLA.

## Assignment & routing (user -> tech)

TWO-LAYER routing, both reusing existing primitives — no routing engine, just nullable columns + one `RequestRouter` service.

Layer 1 — route to a GROUP, automatically and deterministically on submit. Every request lands in a support group (a `Team`), never directly on a person. `assigned_team_id` resolves by first match: (1) the catalog item's `fulfilling_team_id` (strongest signal; the design leads with a templated catalog — e.g. VPN access -> Sysadmin); (2) a configurable type->team map (ST -> IT Support Tier 1, SR/AR -> fulfilment group, CR -> Sysadmin); (3) fallback to the catch-all IT Support triage team. `assignee_id` stays NULL = the design's italic "Unassigned" / "Needs triage" lane. Start with ~3 groups: IT Support (Tier 1, catch-all), Sysadmin/Infra, Procurement/Asset.

Layer 2 — route to a PERSON, manual by default. Techs work the group's "My queue / Unassigned" view and self-assign, or a triager/lead push-assigns. This matches the design's per-row assignee dropdown, "Mine/Unassigned" toggle, and "Triage queue"/"Reassign" CTAs. Manual pickup is correct at ~5-agent scale (the design's "Top resolvers" shows ~4 agents + interns). Optional per-group `auto_assign` flag (manual | round_robin | load_based), OFF by default; when on, use least-open-load over the team's active members (self-corrects for absences). Skill-based routing is unnecessary — model "skill" as group membership.

WHO: add one `agent` (technician) role to RolePermissionSeeder with the request permissions; requesters are the existing `user` role (create + own-request access only). Role is derived server-side per the design (no role selector) — the same /requests URL renders the requester card tracker or the agent triage table by role. A support group = a `Team` whose members hold `agent`.

REASSIGN / RE-GROUP / ESCALATE: reassign (change assignee_id) and re-group (change assigned_team_id; = ITIL functional escalation to a more specialised group) both require `assign-requests` and write an AuditLogger entry with old/new values. Hierarchical escalation on SLA risk stays human: if SLA-at-risk while still Unassigned, notify the group lead and pin to "Needs triage"; if owned, notify owner + lead. Do NOT auto-reassign owned tickets.

CROSS-TENANT: COMFAC techs must see requester tickets across client branches/companies (the design shows requesters like joan.cabral@cornersteel.com / Manila HQ). Grant the agent Team a `CrossTenantGrant` (and `BranchAccessGrant` where branch isolation is on) so the existing CompanyScope lets the whole support group read across tenants without weakening scope for normal users. The requester's company_id/branch_id/department_id are denormalised onto the request at submit for routing + manager visibility + reporting.

## SLA & escalation

TWO clocks per request (ITIL standard), both snapshotted at creation so later policy edits never rewrite history, and both stored as ABSOLUTE due timestamps so the table/chips compare now() vs due_at with zero per-row math (Octane-friendly):
- Response (first-response) SLA: creation -> first agent action off `pending` (`first_responded_at`). Drives "Needs triage" pressure.
- Resolution SLA: creation -> `resolved` (`resolved_at`).

DEFAULT MATRIX (type x priority -> response / resolution), reconciled with the SLAs the design advertises (ST <4h, SR 1-3d, AR 5-10d, CR 3-5d). Business days/hours unless noted. ST: Critical 15m/4h, High 30m/1bd, Med 2h/2bd, Low 4h/3bd. SR: Critical 30m/4h, High 2h/1bd, Med 4h/2bd, Low 1bd/3bd. AR: Critical 2h/2bd, High 4h/5bd, Med 1bd/7bd, Low 1bd/10bd. CR: Critical(emergency) 30m/8h, High 4h/3bd, Med 1bd/5bd, Low 1bd/10bd. Resolution order when sources disagree: catalog-item SLA -> type x priority matrix -> type default. Self-service items (password reset) carry NO resolution SLA so they don't pollute compliance %.

BUSINESS HOURS: one company calendar (Mon-Fri 08:00-18:00 Asia/Manila + holidays) for Med/Low; a 24x7 clock for Critical/emergency so a P1 breaches overnight. MVP uses a simple BusinessHours helper to compute the absolute due_at once; the full holiday-calendar/multi-branch-calendar engine is deferred (resolves the conflict between the sla-escalation calendar proposal and the data-model flat proposal in favour of "dual clocks now, calendar engine later").

CHIPS (derived `sla_state` over the most-urgent unmet clock): Normal/purple "Due {remaining}"; At risk/amber at 80% of target elapsed (configurable warning_pct) -> drives the "SLA at risk (5)" saved view; Breached/rose `now() > due_at` -> "PAST SLA · {overdue}" + the table's "SLA breached · 4h overdue" secondary line; Paused/neutral while awaiting requester; Met/frozen at resolution.

PAUSE: awaiting_requester pauses BOTH clocks; on resume, push due_at forward by the paused duration. Approval runs on a separate timer — resolution clock starts only after approval clears.

DASHBOARD SLA COMPLIANCE % = resolved-within-resolution-target / requests-reaching-terminal-state, over the window (Today/7d/30d/90d). Exclude cancelled and self-service/no-SLA items (matches the design's "96.4% · 1 of 28 past SLA · last 7d"). Badge: >=98% healthy, 90-98% watch (the design's amber state), <90% breach.

EVALUATION + ESCALATION: a scheduled Artisan command `requests:check-sla` runs on the existing database/Redis queue (every 1-5 min; queued notifications, never request-time loops — consistent with Octane). It recomputes the cached `sla_state` and fires the ladder: at-risk -> notify assignee; breach -> notify assignee + group lead, flag row rose; breach + still unassigned after a grace window -> notify lead and pin to triage (auto-assign-to-lead is a Phase-2 option); continued breach -> (Phase 2) bump priority one level and recompute due_at; Critical breach -> page the IT manager. All audited; SLA defaults (warning_pct, auto-resolve days, timezone) live in config/portal.php to survive config:cache.

## Approvals

PRINCIPLE: approval is a GATE, not a status. The request keeps its four-status lifecycle; a gated request additionally carries the derived `awaiting_approval` sub-state (= a pending `request_approvals` row) — this is what the dashboard "4 awaiting approval" card and the "Approved by manager · awaiting procurement" timeline line render.

WHICH TYPES (final policy, driven by catalog flags + a cost threshold, not type alone):
- ST: never (incidents are not approved — speed wins; ~80% of volume).
- SR: only when the catalog item is flagged `requires_approval` (access-granting/licensed: VPN, GitLab, shared drive). Plain SRs (password reset, email alias) auto-fulfil.
- AR: only when est_cost > threshold (default configurable, e.g. PHP 15,000); under threshold = manager-only or none.
- CR: always (production risk; the one type ITIL mandates approval for).

WHO APPROVES — derived from the EXISTING scoped-role model, NOT a manager_id FK (none exists in User/Branch/Department; confirmed). The approver pool = users for whom `ScopedPermissionService::can($candidate, 'approve-requests', ['department_id'=>..,'branch_id'=>..,'company_id'=>..])` is true for the requester's org context. "Manager" = `manager` role scoped to the requester's department; "branch/dept head" = `branch-manager` scoped to the branch; CAB = a new company-scoped `change-approver` role (quorum-of-1 by default). Resolve to a concrete pool at submit time by walking department -> branch -> company until non-empty (company-admin is the never-fail fallback), and SNAPSHOT the resolved pool onto the approval row so later org changes don't orphan a pending approval.

STEPS: single-step by default (one manager). Two-step sequential only for AR-over-threshold (manager -> branch/finance) and CR (owner/manager -> CAB). Schema supports N ordered steps via a `sequence` column, but configure only 1-2; sequential, not parallel.

AUTO-APPROVAL: (a) requester themselves holds approve-requests for the scope, (b) catalog item marked auto_fulfil (e.g. password reset -> no approval row created at all), (c) AR under threshold. When a gate is bypassed, still record an audited `request.approval.auto_approved` reason.

REJECTION: terminal -> request goes to `cancelled` with reason "Approval declined" + mandatory comment, audited `request.approval.rejected`; requester is notified and may clone-and-resubmit (the design's "reuse as template / copy" affordance). Offer a softer "request changes" (return to requester) for SR/AR. No separate Rejected status.

LIFECYCLE + SLA: gate sits after submit, before a tech is assigned. The IT fulfilment SLA clock is PAUSED while awaiting approval and "time to approve" is tracked separately, so business-side approval latency never degrades the design's SLA-compliance %.

Enforcement: a `RequestApprovalPolicy extends BasePolicy` (super-admin/developer bypass via before()); per-decision checks run through ScopedPermissionService with the requester's company/branch/department context.

## Data model

All `requests`/child tables use the `BelongsToCompany` trait (carry `company_id`, auto-stamped on create, auto-filtered by CompanyScope). Catalog + SLA policies are org-wide reference data and intentionally SKIP the trait.

requests (the spine): id; number string unique (e.g. ST-9812); company_id FK; branch_id FK nullable, department_id FK nullable (denormalised from requester for routing/reporting); type enum(ST,SR,AR,CR); category_id FK nullable -> request_categories; title; description; status enum(pending,in_progress,resolved,cancelled) default pending; priority enum(critical,high,medium,low) default medium; requester_id FK -> users; assignee_id FK nullable -> users (null = Unassigned); assigned_team_id FK nullable -> teams (the queue); cancel_reason string nullable; source enum(portal,email,agent) default portal; form_data json nullable; sla_policy_id FK nullable; response_due_at / resolution_due_at timestamps; response_target_minutes / resolution_target_minutes int (snapshots); response_paused_ms / resolution_paused_ms int; sla_state string (cached: ok/at_risk/breached/paused/met); submitted_at, triaged_at, assigned_at, first_responded_at, blocked_at, resolved_at, closed_at, reopened_count; timestamps + softDeletes. Indexes: company_id; (company_id,status); status; assignee_id; assigned_team_id; requester_id; resolution_due_at; unique(number).

request_categories (service catalog, org-wide, NO trait): id; parent_id self-FK (Access & accounts > VPN access tree); name; slug unique; icon (lucide name); description; default_type enum; default_priority enum; sla_policy_id FK nullable; fulfilling_team_id FK nullable; requires_approval bool; approval_type enum(none,manager,custom); auto_fulfil bool; form_schema json; is_active bool; sort_order; timestamps + softDeletes.

sla_policies (org-wide reference, NO trait for MVP simplicity): id; name; type enum nullable; priority enum; response_minutes int; resolution_minutes int; business_hours_only bool default true; is_24x7 bool default false; warning_pct int default 80; is_active bool; timestamps; unique(type,priority).

request_comments: id; request_id FK cascade; company_id FK; author_id FK -> users; body text; is_internal bool default false (agent-only note, hidden from requester; public comments can trigger awaiting_requester); timestamps + softDeletes; index(request_id).

request_events (append-only per-ticket activity timeline the UI renders — distinct from the global AuditLog): id; request_id FK cascade; company_id FK; actor_id FK nullable -> users; event_type string (created, assigned, group_changed, status_changed, commented, approval_requested, approved, rejected, sla_breached, reopened, resolved, closed); from_value / to_value string nullable; meta json nullable; created_at only. Index(request_id, created_at).

request_approvals (the design's "awaiting approval"): id; request_id FK cascade; company_id FK; sequence int default 1; approver_id FK nullable -> users (resolved approver); approver_pool json (snapshot of eligible approvers); status enum(pending,approved,rejected,auto_approved) default pending; decided_by FK nullable; decided_at timestamp nullable; comment text nullable; timestamps; index(request_id,status). (Single table with sequence; N-step ready without schema change — resolves the approvals-vs-data-model conflict toward the simpler shape.)

request_attachments: id; request_id FK cascade; comment_id FK nullable; company_id FK; uploaded_by FK; disk; path; original_name; mime; size_bytes; created_at; index(request_id). Bytes on a Storage disk (local now, S3-ready); metadata only in DB; served via a policy-gated streaming route (no public URLs).

request_sequences (Octane-safe ticket numbering): (company_id, type, last_number); allocated with lockForUpdate() inside the create transaction in a Request::creating hook (no in-process static counter — it would leak across persistent workers). Format {PREFIX}-{n}.

saved_views (Phase 1.1, uses trait): id; company_id; user_id FK; name; filters json; is_shared bool; sort_order; timestamps — powers the design's "Save current view".

Relationships: User hasMany requests as requester_id (submitted) and assignee_id (assigned), hasMany request_approvals as approver. Team hasMany requests (queue). Company/Branch/Department hasMany requests (reporting). Request belongsTo requester/assignee/team/category/slaPolicy; hasMany comments/events/attachments/approvals.

## API surface

All endpoints behind the existing `auth:sanctum` + `EnsureUserIsActive` middleware. A UNIFIED `/api/requests` resource separated by POLICY + a `?view=` param, not duplicated URLs (audience = requester vs agent is derived server-side, matching the design's single role-gated /requests URL). Status transitions live in a `RequestService` state machine (not controllers); each transition emits a request_events row + an AuditLogger->log() call. A FormRequest guards each write action; `TenantAccess::assertTenantAssignment()` guards branch_id/department_id on writes; `RequestPolicy extends BasePolicy` inherits the super-admin/developer before() bypass.

REQUESTER (own requests):
- GET  /api/requests?view=mine — "Submitted by me" / card tracker (auto-filtered to requester_id=me unless view-all-requests).
- POST /api/requests — create (type, category_id, title, description, form_data, attachments[]).
- GET  /api/requests/{request} — detail + timeline (policy: requester or view-all).
- POST /api/requests/{request}/comments — public reply.
- POST /api/requests/{request}/attachments.
- POST /api/requests/{request}/cancel — requester withdraw (status -> cancelled).
- POST /api/requests/{request}/reopen — within N days of resolved.
- GET  /api/catalog , GET /api/catalog/{category} — service catalog tree for the New request wizard.

AGENT (queue):
- GET  /api/requests?view=triage|queue|sla_at_risk|unassigned|awaiting_requester|closed_this_week&type=&status=&priority=&assignee=&team= — the triage table + saved views (requires view-all-requests). Saved views = parameterised, CompanyScope-bound queries: Needs triage = pending & assigned_team set & assignee null; My queue = assignee=me & open; SLA at risk = open & resolution_due_at <= now()+threshold; Awaiting requester = blocked_at not null; Awaiting approval = has pending approval; Closed this week = closed_at >= start_of_week.
- POST /api/requests/{request}/assign (assignee_id|team_id) — assign-requests.
- PATCH /api/requests/{request} — status/priority/category/team (perms gate transitions).
- POST /api/requests/{request}/resolve (resolve-requests) ; POST .../close (close-requests).
- POST /api/requests/{request}/comments with is_internal=true.
- POST /api/requests/bulk — bulk assign/status for the table's checkbox column.
- GET  /api/requests/metrics — dashboard KPIs (open queue, SLA compliance %, avg resolution overall + by type, volume trend, by-type, top resolvers).
- GET  /api/requests/export — Export CSV.

ADMIN / APPROVER:
- apiResource('catalog', RequestCategoryController) — CRUD (manage-catalog).
- apiResource('sla-policies', SlaPolicyController) — CRUD (manage-sla).
- GET  /api/approvals?status=pending — the "4 awaiting approval" inbox.
- POST /api/approvals/{approval}/approve ; POST .../reject (approve-requests, scope-checked via ScopedPermissionService).

Resources: RequestResource (requester, assignee, category, computed sla_state, age, progress), RequestDetailResource (+ comments/events/approvals), RequestCategoryResource, SlaPolicyResource, ApprovalResource, MetricsResource. Notifications fan out via queued (ShouldQueue) Laravel Notifications on the database (bell) + mail channels (User already has Notifiable).

## Automation (auto vs manual)

AUTOMATIC (MVP) — the clerical bookkeeping:
- Auto-acknowledge on submit: stamp submitted_at, generate the typed ID (ST-/SR-/AR-/CR- via request_sequences + lockForUpdate), status=pending, assignee=Unassigned, fire a queued RequestSubmitted notification (bell + email) with ID and SLA target.
- Auto-route to a Team queue (catalog fulfilling_team -> type->team map -> IT Support fallback). NEVER auto-assign to a named person at ~5-agent scale — the design's "Needs triage"/"2 unassigned"/"Mine/Unassigned" toggle depends on a human picking up.
- SLA timer start + absolute due_at computation on submit; the scheduled requests:check-sla command flips sla_state (ok/at_risk/breached) and fires at-risk/breach notifications.
- SLA pause while awaiting requester (the single most important nuance — without it the 96.4% KPI is meaningless).
- Safe auto-transitions: agent public reply asking for info -> awaiting_requester (per-reply opt-out checkbox, default on; internal notes never change status); requester reply while awaiting_requester/resolved -> in_progress, clock resumes (the "1 new reply" badge); auto-CLOSE resolved -> closed after N=5 business days of requester silence (with a "will close unless you reply" notice, configurable).
- Approval ROUTING + reminders: route CR/access/over-threshold-AR into awaiting_approval, notify the approver, remind if pending > 1 business day.
- Notifications via queued (ShouldQueue) Laravel Notifications on bell (database) + email (mail). Recipients per event: requester (submitted, agent reply, awaiting-requester, resolved, closed, approval decision); assignee (assigned/claimed, requester reply, SLA at-risk/breach on their ticket, @mention); team/unassigned (new in queue, SLA at-risk while unassigned); approver (pending + reminder).
- Dashboard KPIs: read-only aggregates over requests + AuditLog (SLA %, MTTR overall + by type, volume trend, by-type, top resolvers), short-TTL cached (the design header says "last updated 12s ago").

MANUAL (correct at this scale — do NOT automate): assignment to a named tech; priority setting + SLA overrides (default Medium, agent sets real priority at triage); resolve + resolution note (never auto-resolve from inactivity in MVP); the approve/reject DECISION (automate only routing + reminders); merge/duplicate (MVP = manual "Mark as duplicate of #ID" that links and closes the dup); priority-bump / auto-reassign on breach (MVP surfaces the design's "Reassign" CTA; automation is Phase 2).

## MVP - build first

1. requests table + Request model with BelongsToCompany trait, type enum (ST/SR/AR/CR), the four design statuses, and per-company/per-type ticket numbering (request_sequences + lockForUpdate, Octane-safe)
2. RequestService state machine enforcing the base transitions server-side (422 on illegal jumps), emitting a request_events row + AuditLogger call per transition; add request.* action constants to AuditLog
3. RolePermissionSeeder additions: new agent + change-approver roles; permissions create-requests, view-requests, view-all-requests, comment-requests, assign-requests, triage-requests, resolve-requests, close-requests, approve-requests, manage-catalog, manage-sla; RequestPolicy + RequestApprovalPolicy extends BasePolicy
4. Unified /api/requests resource: requester create/view/comment/cancel/reopen on own; agent triage table + saved views (Needs triage, My queue, SLA at risk, Awaiting requester, Closed this week, All) as CompanyScope-bound query presets; assign/resolve/close action routes
5. Requester surfaces: New request from a type or catalog item, my-requests card tracker (4-step timeline), Submitted-by-me tab
6. Service catalog: request_categories table + admin CRUD; the design's catalog tiles (VPN access, password reset, new laptop, email alias) drive type/priority/SLA/team/approval per row
7. Auto-route to a Team queue on submit (catalog fulfilling_team -> type->team map -> IT Support fallback); ~3 seeded groups (IT Support, Sysadmin, Procurement); manual pickup; grant the agent Team a CrossTenantGrant for cross-company requester visibility
8. Two SLA clocks (response + resolution) with snapshotted absolute due_at; sla_policies matrix; computed at-risk(80%)/breached chips + dashboard SLA compliance %; simple business-hours helper (defer full calendar engine)
9. scheduled requests:check-sla command on the existing queue: recompute sla_state, fire at-risk/breach notifications; SLA pause while awaiting requester; auto-close resolved->closed after 5 business days
10. Approvals: request_approvals table; gate CR (always) + access-SRs (catalog flag) + AR over cost threshold; single-step manager default, approver derived via ScopedPermissionService (no manager_id FK); /api/approvals inbox + approve/reject; reject -> cancelled with reason; pause SLA while awaiting approval
11. Public vs internal comments (is_internal); public reply auto-moves to awaiting_requester (opt-out), requester reply resumes
12. Queued notifications on bell (database) + email (mail) for the core events; manual Mark-as-duplicate
13. Dashboard command center: open-queue gauge, SLA compliance %, avg resolution overall + by type, volume trend, by-type breakdown, Top resolvers, Recent activity (from AuditLog), and the 3 pulse cards (past SLA / unassigned / awaiting approval)

## Roadmap (after MVP)

### Phase 2 — efficiency + escalation

Canned responses/saved-reply snippets then full macros (reply + set status + priority in one click); auto-reassign-to-lead and priority-bump on continued breach (the full escalation ladder, audited); per-group person-level auto-assign (least-open-load) behind a setting; saved_views persistence ('Save current view'); true ticket merge (thread combine) beyond mark-as-duplicate; CSAT survey on close; reopen-rate + first-response-compliance reporting.

### Phase 3 — calendar + catalog depth

Full business-hours calendar engine (holidays, multi-branch calendars via the existing branch_id + enforce_branch_isolation pattern); per-catalog-item dynamic form builder (form_schema editor in admin); richer approval chains (2-step AR finance, configurable CAB quorum N-of-M); email-to-ticket inbound channel (source=email already modelled); digest emails.

### Phase 4 — ITIL maturity (only if scale demands)

Linked Knowledge Base articles on resolve (KB nav already in the design); problem management (group recurring incidents); lightweight asset/CMDB linkage for AR/CR; SLA OLAs across internal groups. Deliberately deferred — unwarranted at ~200 staff until volume proves the need.

## Key decisions (recommendations)

1. **Name and shape of the core entity — tickets vs requests, one table or four?**
   -> ONE `requests` table (Eloquent Request model) with a `type` discriminator. 'Ticket' is the UI synonym (the dashboard counts 'open tickets'); standardise the DB/model on 'request' to match the design's 'Requests' page and 'request types'. Four separate tables/engines are wrong — the unified inbox, shared row shape, and shared status pills require one table.

2. **How many stored statuses? (taxonomy proposal says 7, design shows 4)**
   -> Persist exactly the design's FOUR: pending, in_progress, resolved, cancelled. Model awaiting_approval as a pending request_approvals row, awaiting_requester as a blocked_at flag, and closed as a closed_at timestamp on resolved. The design's pills are final; the saved views and 'awaiting approval' card are derived/filterable sub-states, not enum values.

3. **One SLA clock or two, and how much calendar machinery in MVP?**
   -> Two clocks (first-response + resolution), snapshotted as absolute due_at for cheap Octane reads. But ship MVP with a simple business-hours helper and ONE company calendar; defer the full holiday/multi-branch calendar engine to Phase 3. This reconciles the dual-clock proposal with the data-model's flat-SLA pragmatism.

4. **Auto-assign to a named tech, or only route to a Team queue?**
   -> Route to a Team queue as Unassigned on submit; a human picks up. Do NOT auto-assign to individuals at ~5-agent scale — the design's triage flow depends on it. Per-person least-open-load auto-assign is a Phase-2 per-group opt-in.

5. **How is the approver determined, given no manager_id FK exists?**
   -> Derive from the existing scoped-role model via ScopedPermissionService::can(user,'approve-requests',context) over the requester's department->branch->company (company-admin is the never-fail fallback). Do NOT add a reporting-line tree. Snapshot the resolved approver pool onto the approval row. This is the single most important fit decision.

6. **Which request types require approval, and how heavy?**
   -> CR always; access-SR when the catalog item is flagged requires_approval; AR only above a configurable cost threshold; ST never. Single-step manager by default; two-step sequential only for AR-over-threshold and CR (CAB-lite = one company-scoped change-approver, quorum-of-1). Drive the gate off the catalog flag + threshold, not the type alone.

7. **How are rejections represented in the four-status model?**
   -> Rejection is terminal -> status=cancelled with cancel_reason='Approval declined' + a mandatory approver comment, audited as request.approval.rejected; requester may clone-and-resubmit. Offer a softer 'request changes' return for SR/AR. Do NOT add a separate Rejected status.

8. **Does the SLA clock pause, and for what?**
   -> Yes — pause both clocks while awaiting_requester (push due_at forward on resume) AND while awaiting_approval (approval runs on a separate 'time to approve' timer). Without the awaiting-requester pause the design's 96.4% SLA KPI is misleading. Add a 3-bd nudge and 7-bd auto-resolve guard so paused tickets don't game the metric.

9. **Resolved vs Closed — keep distinct even though the requester UI shows only Resolved?**
   -> Yes. Closed is a terminal sub-state of resolved (closed_at), reached on requester confirm or auto-close after 5 business days, so the reopen window, 'Closed this week (23)' view, and SLA-stop are accurate. The requester's 4-step timeline collapses both into its final step for friendliness.

10. **Per-ticket timeline vs the existing global AuditLog — one or both?**
   -> Keep BOTH. request_events (append-only, typed) powers the user-facing activity feed the design renders; AuditLogger->log() writes the global security/compliance trail (actor, IP, UA). Add request.* action constants to AuditLog. They serve different readers.

11. **How do agents see tickets that belong to other tenants/branches?**
   -> Grant the agent Team a CrossTenantGrant (and BranchAccessGrant where branch isolation is on) so the existing CompanyScope lets the whole support group read requester tickets across companies/branches, without weakening scope for ordinary users. Denormalise requester company_id/branch_id/department_id onto the request at submit.

12. **API URL shape — split by audience or unified?**
   -> Unified /api/requests with ?view= presets (mine, triage, queue, sla_at_risk, unassigned, awaiting_requester, closed_this_week) and policy-based visibility, plus action sub-routes (assign, resolve, close, cancel, reopen, comments, attachments). Separate admin resources for catalog and sla-policies, and an /approvals inbox. Audience is separated by policy + view param, not duplicated URLs — matching the single role-gated /requests URL in the design.
