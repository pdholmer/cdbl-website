# Night Game Builder, Prompt 3: lit header, shared shell, Prompt 2 follow-ups

Visual and navigation only. Nothing here touches the database, auth, RLS, edge functions or payments. Role checks reuse the existing role read (`fetchMyRoles`) and the `adminAccess` map; no new queries, no guard changes. Seal and wordmark images are used unaltered.

## Part 1: Prompt 2 follow-ups

a) Admin dashboard: when urgent feedback and a live draft are both present, only the urgent card is `card-alert`. The live draft renders as a normal textured card (card surface, mesh, 1px border) with a blue pill "Open live draft" button. A live draft alone keeps the blue flood. HeroAlertCard gets a `flood` prop; Dashboard decides.
b) Re-measure dark-mode `text-destructive` (#F2B8B5) on the two-step screen against the dark background and card; expected about 10:1. Report the measured ratio.
c) Training at 768: Training and Situation detail currently use the public site header, whose link causes the sideways scroll. Both move into the new shell (parent/coach variant), so the public header is no longer on those pages. The public header itself stays untouched.
d) Add a full comment block in index.css: no colored bar on the left, right or top edge of any card, list row, menu item, tab or table row; no border-left/border-t accent colors, pseudo-element strips, or inset box-shadow bars; selection and emphasis are shown only by a full flood (`.is-selected`, `.card-flood`, `.card-alert`); neutral 1px borders are allowed.

## Part 2: shared signed-in shell

One `AppShell` component wraps /household, /account, /training, /training/:slug, /coach/* and /admin/*. It replaces FamilyHeader, AdminLayout's header/sidebar and CoachLayout's header/sidebar. Page content and data loading are unchanged; pages only drop their old wrapper and pass `label` and `title` to the shell.

### Registration flow: flag
There is no signed-in registration flow today. /registration is a public page (public header, PageGate) and outside the signed-in look. Plan: leave it alone in this step; the shell is ready to wrap it when the signed-in registration flow is built. Say if you want /registration moved into the shell now (it would also need adding to the signed-in path list).

### 1. Lit header ("stage")
- Dark: #0E1518, radial white 22% from top right, radial rgba(80,140,150,.22) from top left, plus `.tex-twill`.
- Light: #E2E7EE, radial white from top right, plus twill.
- Contents: seal 36px (home link, 44px tap area), label in Barlow Semi Condensed 11px, 0.16em, uppercase, muted (for example "2027 SPRING · IN-HOUSE"), headline Big Shoulders Display 900 uppercase, 40px phone, clamp 34 to 56px desktop. Right side: account and sign-out (44px icon buttons, aria-labels).
- Label source: the current season name and program type already loaded on the page where available; otherwise a fixed area label ("LEAGUE OFFICE", "COACH", "FAMILY"). No new data reads.
- Note on your ban list: the westmark workspace rules forbid uppercase letterspaced labels and middle-dot strings, but they do not apply here because CDBL has its own system and you specified these. I will follow your spec.

### 2. Piping line
3px line under the header: CDBL Blue, with a break at 70 to 76% of the width filled white on dark and #221F20 on light. Pure CSS gradient.

### 3. Phone tab bar (under 768px)
Fixed bottom, 5 tabs, 44px+ targets, 10px labels, 20px outline icons, `padding-bottom: env(safe-area-inset-bottom)` (adds `viewport-fit=cover` to the viewport meta). Active tab is a blue flood pill with white icon and label. Page content gets bottom padding so nothing hides behind the bar. The floating help button moves above the bar.

Role is picked the same way landing works: staff roles get the admin set, coaches the coach set, everyone else the parent set.

Parent:
- Home: /household
- Schedule: no family schedule page. Points to /household#upcoming (the Upcoming section already on Household).
- Players: no page. Points to /household#family (Your family section).
- Messages: no page. Points to /household#team (the team section that shows coach contact). Label stays "Messages" per spec; say if you prefer "Coach".
- Account: /account

Coach:
- Home: /coach
- My Team: no page. Points to /coach (team activity section anchor).
- Schedule: no coach schedule page. Points to the public /schedule.
- Messages: no page. Proposal: hide the tab label "Messages" and use "Training" (/training) instead, or keep "Messages" pointing to /coach. Your choice; default is Training.
- More: a bottom sheet with Training, Account, Sign out.

Board and admin:
- Home: /admin
- Registrations: no /admin/registrations page. Points to /admin/commissioner (its Registrations tab) for roles that can open it, otherwise /admin/players.
- Teams: /admin/teams
- Schedule: /admin/schedule
- More: bottom sheet listing the sidebar groups below (role-filtered).

Tabs a role cannot open (per `canAccessAdminPath`) are replaced by the next allowed link, never shown disabled.

### 4. iPad and desktop sidebar (768px and up)
220px, card surface with mesh, seal plus "LEAGUE OFFICE" in Big Shoulders. Group labels small letterspaced uppercase muted. Active item is a full blue flood. Groups with no allowed links are hidden (`canAccessAdminPath`). Coach and parent get a short sidebar with their 5 tab destinations.

Every current admin sidebar link and where it lands:

| Current link | Route | New group / label |
|---|---|---|
| Dashboard | /admin | Top: Home |
| Players | /admin/players | Run the season: Players |
| Teams | /admin/teams | Run the season: Teams and coaches |
| Coaches | /admin/coaches | Run the season: Coaches (flag, see below) |
| Drafts | /admin/drafts | Run the season: Draft |
| Commissioner | /admin/commissioner | Run the season: Registrations (flag) |
| Schedule | /admin/schedule | Game days: Schedule |
| Facilities | /admin/facilities | Game days: Facilities (flag) |
| Concessions | /admin/concessions | Game days: Concessions |
| Communication | /admin/communication | Talk to families: Messages |
| Requests | /admin/requests | Talk to families: Help requests (flag) |
| (not in sidebar today) | /admin/email-bounces | Talk to families: Email problems |
| Programs | /admin/programs | League setup: Seasons and programs |
| Divisions | /admin/divisions | League setup: Divisions |
| Registration Codes | /admin/registration-codes | League setup: Fees and codes |
| Site Content | /admin/site-content | League setup: Site pages |
| FAQs | /admin/faqs | League setup: FAQs |
| Support | /admin/support | League setup: Sponsors and donations (flag) |
| GameChanger | /admin/gamechanger | Game days: GameChanger import (flag) |
| Committee Tasks | /admin/committee-tasks | Board: Committee tasks |
| Reports | /admin/reports | Board: Reports |
| Feedback (archive) | /admin/feedback | Board: Feedback |
| Users | /admin/users | Board: People and roles |
| Profile, My household, Account | /admin/profile, /household, /account | Sidebar footer (account area) |

Flags:
- "Teams and coaches" is two pages. Plan keeps one "Teams and coaches" link to /admin/teams plus a separate "Coaches" link, because the background-checks role can open Coaches but not Teams.
- "Registrations" has no page of its own; it lands on the Commissioner page. Board/admin and commissioners can open it; registrars cannot today (the guard admits admin only), so they get Players instead.
- "Fields": project memory says the UI always says "Facilities". Plan keeps "Facilities"; say if you want "Fields".
- Requests, Support and GameChanger were not in your grouping; placements above are proposals.
- /admin/profile is linked today but has no route (lands on Not Found). Plan drops it from the footer; Account covers it.
- Coach sidebar's "My Drafts" (/coach/drafts) also has no route; dropped.

### 5. Shared rules
44px tap targets everywhere in the shell; icons per Prompt 2 (outline, 1.75, currentColor, only on tabs, sidebar links and actions); no edge bars; tab-pill and sheet motion turned off under prefers-reduced-motion.

## Acceptance checks
Light and dark at 390, 768 and 1280 on Household, Account, Training, Situation detail, Coach, Admin dashboard and one admin list page (admin pages need a completed emailed code in the test session; if the test session cannot pass it, I will say those were not checked). No sideways scroll, text contrast at least 4.5:1 (including on the lit header and piping), at most one flood per screen, no edge accent bars (scripted scan for colored border-left/top), seal file unchanged.

## Technical details
- New: `src/components/shell/AppShell.tsx`, `LitHeader.tsx`, `TabBar.tsx`, `ShellSidebar.tsx`, `MoreSheet.tsx`, `src/lib/shellNav.ts` (tab and group config, filtered by `canAccessAdminPath` and `pickLanding` role logic).
- Changed: `AdminLayout.tsx` and `CoachLayout.tsx` become thin wrappers around AppShell; `AdminSidebar.tsx` retired; `FamilyHeader.tsx` retired (export removed from family index); Household, Account, Training, SituationDetail wrap in AppShell; HeroAlertCard and admin Dashboard (follow-up a); `src/index.css` (stage, piping, ban-rule comment); `index.html` viewport-fit; `AGENTS.md` rule: signed-in pages use AppShell only.
- Admin pages keep using AdminLayout, so their files do not change.
- Undo: revert these files; no data or settings.
