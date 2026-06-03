# Handoff: Porti — Complete Design

## Overview
**Porti** is COMFAC IT's internal service portal (rebranded from "COMFAC IT Service Portal"). This bundle contains the **entire design** — every public, auth, applicant, and admin surface — as one navigable design canvas plus the individual frame source files.

Open **`source/Porti.html`** in a browser to see everything laid out on a pan/zoom canvas (Figma-style). Use `0` to reset zoom, `1` to fit all.

## About the design files
The files in `source/` are **HTML/JSX design references**, not production code. They render via React 18 + Babel-standalone in the browser for preview only. Recreate these designs in the target codebase's existing environment (Next.js, React, Vue, etc.) using its established components and patterns — or, if no environment exists yet, choose the best-fit framework. Use the files for pixel reference, structure, copy, states, and token values.

## Fidelity
**High-fidelity.** Colors, typography, spacing, copy, and component states are final.

## How the files are organized
```
source/
├── Porti.html             ← Master file — loads everything onto the design canvas
├── app.jsx                ← Canvas composition: which frames render in which sections
├── design-canvas.jsx      ← Pan/zoom canvas wrapper (preview tooling — NOT part of the product)
├── tweaks-panel.jsx       ← Tweaks tooling (preview only — ignore for production)
├── tokens.css             ← All design tokens (colors, spacing, shadows) extracted for convenience
├── ui-kit.jsx             ← Shared primitives: Icon, Logo, BrowserChrome, Pill, ServiceGlyph
├── assets/comfac-logo.png ← Original logo (reference only — Porti's mark is code, see rebrand.jsx)
└── frames/                ← One file (or a few) per product area:
    ├── rebrand.jsx          Logo system + the PoroMark SVG (faceless poro emblem)
    ├── landing.jsx          Public landing page (scrollable: hero, apps carousel, Porti's Workshop, Shipped timeline, By the Numbers, footer)
    ├── all-services.jsx     "All services" modal (opened from landing)
    ├── login.jsx            Login — all states + 2FA + password reset + bold variant
    ├── intern-apply.jsx     Internship application — public entry (email gate)
    ├── apply-flow.jsx       Application steps: verify code, details, resume upload, cover letter, success, track + withdraw
    ├── intern-register.jsx  Intern registration wizard (invite code → details → password → success)
    ├── admin-variants.jsx   Admin shell (top-nav) + Dashboard + Services pages
    ├── admin-requests.jsx   Requests triage table
    ├── admin-subnav.jsx     Submenu patterns (secondary tab row, mega-menu)
    ├── my-requests.jsx      "Submitted by me" tab + non-admin card tracker
    ├── board.jsx            Community Board (internal social feed)
    ├── people.jsx           People · Users directory
    ├── people-detail.jsx    User detail — roles, scope, permission matrix
    ├── people-staff.jsx     People · IT Staff + Interns management views
    └── interns-suite.jsx    Interns sub-pages: Invite Codes, WiFi Vouchers, Seat Map, Security, Planning, Attendance
```

## Section map (what's in the canvas, in order)
1. **Logo system** — Porti wordmark + Poro mark, variants, scale test, in-context (`rebrand.jsx`)
2. **Public landing** — scrollable marketing/utility page + All-services modal (`landing.jsx`, `all-services.jsx`)
3. **Login** — 12 states: default, loading, error, locked, expired, not-in-directory, 2FA (+wrong), forgot-password flow (email/sent/new/success), plus a bold spotlight variant (`login.jsx`)
4. **Internship application** — email gate → verify → details → resume → cover letter → submitted (`intern-apply.jsx`, `apply-flow.jsx`)
5. **Track application** — status timeline + withdraw modal (`apply-flow.jsx`)
6. **Admin** — Dashboard, Services, Requests (top-nav shell), Submitted-by-me, Community Board, People (Users + detail + IT Staff + Interns), the 6 Interns sub-pages, and submenu patterns (`admin-*.jsx`, `people-*.jsx`, `interns-suite.jsx`, `board.jsx`, `my-requests.jsx`)
7. **Intern registration** — invite-code wizard (`intern-register.jsx`)

## Design tokens (full set in tokens.css)
- **Primary**: `--purple-700: #5b4dc8` (CTAs, links, accents); lavender `--purple-600: #7b6fdc`, `--purple-500: #9b91e8`
- **Surfaces**: `--paper: #f6f4f9` (page), `--card: #fbfafd` (cards) — never pure white
- **Text**: `--ink-900: #272030` (never pure black), `--ink-500: #6e6878` (body)
- **Borders**: `--ink-100: #ebe7f0`, `--ink-200: #dcd7e3`
- **Semantic**: green/amber/blue/rose/violet/orange, each at `-600` + `-50`
- **Type**: Inter (UI, weights 400–800), JetBrains Mono (`.mono` — IDs, codes, ⌘K)
- **Radii**: 9–10 (inputs/chips) · 12–14 (cards) · 18–20 (modals/hero) · 99 (pills)
- **Shadows**: `--shadow-sm`, `--shadow`, `--shadow-lg`

## Important build notes
- **`design-canvas.jsx` and `tweaks-panel.jsx` are preview tooling**, not product. Don't port them. Each frame is also wrapped in a `BrowserChrome` bezel for preview — strip it; build only the inner content.
- **The Porti logo is code, not an image** — `PoroMark` SVG in `frames/rebrand.jsx` (faceless poro silhouette with a "P" carved as negative space). Wordmark "Porti**.**" in Inter 800, trailing period in `--purple-700`. `assets/comfac-logo.png` is the OLD company logo — reference only.
- **All content is admin/server-managed** in production (Workshop projects, Shipped entries, stats, apps, tickets, people, intern data). No hardcoded lists — wire to APIs.
- **Role model**: one User record per person; "IT Staff" and "Interns" are filtered management *views* into the same records, with role-specific columns. Login has no role selector — role is derived server-side.
- **Form sizing**: in multi-step flows (login, application, registration) keep the container **width fixed**; only height changes between steps.

## Per-area handoffs
Three focused sub-bundles already exist if a team wants just one area:
- `design_handoff_porti_landing` — landing page only
- `design_handoff_porti_login_services` — login + all-services modal
- `design_handoff_porti_admin` — dashboard, services, requests

This `_full` bundle supersedes them and contains everything.
