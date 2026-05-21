# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo for a multi-tenant portal system with two separate applications:

- `api/` — Laravel 13 backend (PHP 8.3+)
- `web/` — Next.js 16 frontend (React 19, TypeScript)

## Commands

### API (`api/`)

```bash
# First-time setup
composer setup

# Start all dev services concurrently (server, queue, logs, Vite)
composer dev

# Run tests (uses in-memory SQLite)
composer test

# Run a single test file
php artisan test --filter TestClassName

# Code formatting
./vendor/bin/pint
```

### Web (`web/`)

```bash
npm run dev      # Next.js dev server
npm run build    # Production build
npm run lint     # ESLint
```

> **Important:** `web/` uses Next.js 16.2.6, which has breaking changes from earlier versions. Before writing any Next.js code, check `node_modules/next/dist/docs/` for current API conventions.

## Commit Convention

This repo uses **Conventional Commits** — Release Please reads them to bump versions automatically on merge to `main`.

```
<type>(<optional scope>): <description>

feat(auth): add MFA support          → bumps minor  0.1.0 → 0.2.0
fix(api): correct CORS header         → bumps patch  0.1.0 → 0.1.1
feat!: redesign permission model      → bumps major  0.1.0 → 1.0.0
```

| Type | When to use |
|---|---|
| `feat` | New feature visible to users |
| `fix` | Bug fix |
| `perf` | Performance improvement |
| `refactor` | Code change with no behaviour change |
| `chore` | Tooling, deps, config |
| `docs` | Documentation only |
| `test` | Tests only |

Add `!` after the type or include `BREAKING CHANGE:` in the footer for major bumps.

## Architecture

### API

**Multi-tenant organizational hierarchy:** `Company → Branch → Department → Team → User`

- Users belong to a Company and optionally a Branch/Department, and can join many Teams.
- Authorization uses **Spatie Laravel Permission** (roles/permissions) plus a `UserRoleAssignment` model for explicit role tracking and a `CrossTenantGrant` model for cross-company permission grants.
- All changes are tracked via `AuditLog`.
- Users authenticate via **Laravel Sanctum** (API tokens) and support external SSO via an `authentik_uid` field.
- The API runs on **Laravel Octane** for high performance.
- The `api/` directory also contains its own Vite + Tailwind build pipeline (`resources/`) for any server-rendered views.

**Key model relationships** (`app/Models/`):
- `User` — HasRoles (Spatie), BelongsTo Company/Branch/Department, BelongsToMany Teams, HasMany AuditLogs/RoleAssignments
- `Company` — owns Branches, Departments, Users, Teams
- `Team` — pivot through `team_members`

**Tenant enforcement** (`app/Models/Concerns/BelongsToCompany.php`):
- `Branch`, `Department`, `Team`, `User` all use the `BelongsToCompany` trait.
- This attaches `CompanyScope` as a global scope — every query is automatically filtered to the current user's allowed company IDs.
- Super-admins and developers bypass the scope entirely.
- Cross-tenant read access is granted via `CrossTenantGrant` (supports user- and team-level grantees).
- To bypass the scope in admin code: `Model::withoutGlobalScope(CompanyScope::class)` or `Model::forCompany($id)`.
- Policies (`app/Policies/`) enforce the same rules for single-resource access. The `BasePolicy::before()` hook grants super-admin/developer full access.

**Test environment:** Always uses in-memory SQLite (configured in `phpunit.xml`). No need for a database connection when running tests.

### Web

Early-stage Next.js app. The `src/app/` directory follows the App Router convention. Current state: layout + home page only.

**State management pattern:** React Query (`@tanstack/react-query`) for server state, Zustand for client state.

**Forms:** React Hook Form + Zod for validation.

**Auth:** NextAuth v5 (beta).

**HTTP:** Axios for API calls to the Laravel backend.
