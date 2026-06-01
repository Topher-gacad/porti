# Handoff: Porti — Login & All-Services Modal

## Overview
Two surfaces from the Porti portal (COMFAC IT's rebranded internal service portal):
1. **Login** — the auth gate (`/login`), with full state coverage + 2FA + password-reset flow.
2. **All-Services modal** — an overlay that lists every internal app, opened from the landing page's "See all" / "5 more" action.

## About the design files
The files in `source/` are **HTML/JSX design references**, not production code. They render via React 18 + Babel-standalone in the browser for preview only. Recreate these designs in the target codebase's existing environment (Next.js, React, Vue, etc.) using its established components — or, if no environment exists, choose the best-fit framework. Use the files for pixel reference, structure, copy, and token values.

## Fidelity
**High-fidelity.** Colors, type, spacing, copy, and states are final.

## Files
```
source/
├── preview.html              ← Open in a browser to see all frames stacked
├── tokens.css                ← All design tokens (colors, spacing, shadows)
├── ui-kit.jsx                ← Icon, Logo, BrowserChrome, Pill, ServiceGlyph
├── frames/
│   ├── login.jsx             ← LoginFrameNoRole, Login2FAFrame, ForgotPasswordFrame
│   ├── all-services.jsx      ← AllServicesFrame
│   └── rebrand.jsx           ← PoroMark SVG (faceless poro emblem)
└── assets/comfac-logo.png    ← Original logo (reference only)
```
> Note: each frame is wrapped in a `BrowserChrome` component (fake browser bezel) purely for preview. **Ignore it** — build only the inner content.

---

## LOGIN

### Layout
- Full-viewport, centered. Matte paper background (`--paper`) with two soft lavender radial glows (top-right and bottom-left corners).
- **Card**: max-width 880px, two-column grid `1fr 1.05fr`, radius 20px, `--ink-100` border, `--shadow-lg`.
  - **Left brand panel** (`--card` bg, right border): Porti logo top, headline "Welcome back. Sign in to **Porti.**" (26px/700, "Porti." in `--purple-700`), lede, then 2 feature rows (icon chip + text), then "Need access? it@comfac-it.com".
  - **Right form panel**: title "Sign in to Porti" (20px/700), subtitle, then fields.

### Form fields
- **Work email**: label 11.5px/600 `--ink-700`; input in a `fieldWrap` (paper bg, `--ink-100` border, radius 10, padding 10/12) with a leading mail icon. Valid state shows a trailing green check.
- **Password**: label row has a "Forgot?" link (purple, right-aligned). Input has leading lock icon + trailing **show/hide eye toggle** (`eye` ↔ `eye-off`, turns purple when revealed). Caps-lock warning line appears below in amber when active.
- **Keep me signed in**: checkbox + label.
- **Sign in button**: full-width, `--purple-700`, white, radius 10, 13.5px/600, trailing arrow icon. Inset highlight + purple drop-shadow.
- **"New here? Request access"** centered below.
- **Last sign-in footnote**: small paper chip — "Last sign-in: 2 days ago · Manila HQ · macOS".

### Login states (the `state` prop on `LoginFrameNoRole`)
| state | Behavior |
|---|---|
| `default` | empty form |
| `loading` | button shows spinner + "Signing in…", disabled, `cursor: wait` |
| `error` | rose banner "Email or password incorrect." + red password border + caps-lock hint |
| `locked` | rose banner "Account locked after 5 failed attempts. Try again in 14:32…" |
| `expired` | **amber** banner "Your password expired…" + password pre-revealed |
| `not-in-directory` | rose banner "We can't find this email in the COMFAC directory…" + red email border |

Banner component (`ErrorBanner`): rose or amber tinted, alert icon, 12px text, radius 10.

### 2FA (`Login2FAFrame`, prop `state`: `default` | `wrong`)
- Title "One more step", subtitle "Enter the 6-digit code from your authenticator app."
- Purple info chip: shield icon + "Signed in as jdoe@comfac-it.com".
- **6 code boxes** (flex, gap 6, each 52px tall, radius 10, mono 22px). Active box: purple border + purple-100 ring. `wrong` state: all boxes rose border + rose ring + rose text, plus error banner.
- Row: "Code refreshes in 00:18" (left) + "Use a backup code" (right, purple).
- **"Trust this device for 30 days"** checkbox (pre-checked, purple).
- "Verify & sign in" button + "← Back to sign in".

### Forgot-password flow (`ForgotPasswordFrame`, prop `step`)
1. `email` — "Reset your password" + email field + "Send reset link" (send icon) + back link.
2. `sent` — "Check your inbox" + purple info panel "Email sent to…" + "Resend in 00:58" outline button + back link.
3. `new` — "Set a new password" + new password field (revealed) + 4-seg strength meter ("Strong · 12+ chars · upper · number") + confirm field + "Save & sign in".
4. `success` — green panel "You're good to go. / Sessions on other devices have been signed out." + "Continue to Porti".

### Login interactions
- Submit → if 2FA enabled, go to 2FA step; else dashboard.
- Failed submit increments attempt counter; 5 fails → `locked` with countdown.
- Eye toggle reveals/hides password. Caps-lock detection on keydown.
- Form **column width is fixed**; only its height changes between states — never change the card width across states.

---

## ALL-SERVICES MODAL (`AllServicesFrame`)

### Layout
- Overlay on top of a dimmed/blurred landing page. Dim layer `rgba(39,32,48,.08)` (very light — same family as login, not dark). Same two corner lavender glows as login.
- **Modal**: centered, max-width 880px, max-height 680px, `--card` bg, radius 18px, heavy drop-shadow, `overflow: hidden`, flex column.

### Sections (top → bottom)
1. **Header** (border-bottom): "All services" (18px/700) + "13 internal apps available across COMFAC" subtitle; close **×** icon top-right.
2. **Search + filter** (padding 14/24): search field (paper bg, `--ink-200` border, radius 10, leading search icon, trailing ⌘K hint). Below: filter chips — **All** (active = purple-700 bg/white), Productivity, Operations, Comms, Internal tools (inactive = paper bg + ink-200 border), radius 99.
3. **Service grid** (scrolls inside modal, `overflow-y: auto`): grouped by category. Each category has an 11px uppercase label, then a **2-column grid** of app rows.
   - **App row**: paper bg, `--ink-100` border, radius 12, padding 12/14, flex — `ServiceGlyph` (40px rounded square, letter) + name (13px/600) + description (11px `--ink-500`) + trailing `arrow-up-right` icon.
4. **Footer** (border-top, paper bg): "Need an app that's not here? **Request access →**" (left) + "**View full directory →**" (right, purple).

### Data (`AllServicesFrame` content is admin-managed in production)
Categories & apps shown:
- **Productivity**: ERPNext (Finance, HR, inventory), Nextcloud (Files, calendar, contacts), Mailcow (Email & groupware)
- **Operations**: Synx FMS (Facility maintenance), Synx Sched (Crew scheduling), Steward (Asset & inventory), Fleet (Vehicle tracking)
- **Comms**: Rocket.Chat (Internal messaging), Jitsi (Video conferencing)
- **Internal tools**: Porti (IT service portal), Gitea (Source control), Wiki (Internal knowledge base), BookStack (Documentation)

`ServiceGlyph` props: `letter`, `color` (fg), `bg`. Suggested brand colors are inline in the data array.

### Modal interactions
- **×**, click-outside, or Esc → close.
- Search filters the app list live; filter chips scope by category.
- Clicking an app row → opens that app in a new tab (SSO); `arrow-up-right` signals external.
- Modal body scrolls independently; header/search/footer stay fixed.

---

## Design tokens (full set in tokens.css)
- **Primary**: `--purple-700: #5b4dc8` · lavender `--purple-600: #7b6fdc`
- **Surfaces**: `--paper: #f6f4f9` (page), `--card: #fbfafd` (cards) — never pure white
- **Text**: `--ink-900: #272030` (never pure black), `--ink-500: #6e6878`
- **Borders**: `--ink-100`, `--ink-200`
- **Semantic**: green/amber/blue/rose/violet/orange at -600 + -50 each
- **Type**: Inter (UI), JetBrains Mono (`.mono`, codes)
- **Radii**: 10 (inputs/chips) · 14 (cards) · 18–20 (modals) · 99 (pills)

## Brand asset
The Porti logo is **code, not an image** — `PoroMark` SVG in `frames/rebrand.jsx` (faceless poro silhouette with a "P" carved as negative space). Wordmark: "Porti**.**" in Inter 800 with the period in `--purple-700`. `assets/comfac-logo.png` is the old logo — reference only.

## Out of scope
The signed-in app shell, internship flows, admin pages, landing page (separate handoff). Only Login + All-Services modal here.
