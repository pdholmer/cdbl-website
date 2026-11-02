# Night Game Builder, Prompt 2: textures, floods, icon cleanup

Visual only. Nothing here touches the database, auth, RLS, edge functions or payments. Everything stays scoped under `html.ngb` (signed-in pages). Seal and wordmark images are not touched. Public pages are unchanged.

## 1. Textures (src/index.css, CSS only, no image files)

- `.tex-grain`: inline SVG `feTurbulence` fractal noise as a data URI, 180px tile, on a `::before` layer (pointer-events none). Dark: white noise at 0.07. Light: black noise at 0.05. Applied once, on the signed-in app shell background (ThemeScope wrapper).
- `.tex-mesh`: `radial-gradient(var(--mesh) 1px, transparent 1.4px)` at 5px x 5px over `hsl(var(--card))`. `--mesh` = rgba(255,255,255,.04) dark, rgba(20,30,50,.035) light. Applied to `Card`, the admin sidebar, and round pickers (Account appearance choice, quiz answer and position pickers).
- `.tex-twill`: `repeating-linear-gradient(135deg, var(--twill) 0 1px, transparent 1px 5px)`. `--twill` = rgba(255,255,255,.03) dark, rgba(20,30,50,.035) light. Used only on the lit page header (FamilyHeader and the admin mobile header).

## 2. Flood variants

- `.card-flood`: solid #003DA5, white text, mesh at rgba(255,255,255,.07), sheen `linear-gradient(160deg, rgba(255,255,255,.10), transparent 55%)`. Muted text inside becomes white at 85%.
- `.card-alert`: same treatment on #B3261E.
- `.is-selected` / selected states: solid CDBL Blue, white text. Applied to active tab (Tabs trigger), active sidebar item, chosen chip, chosen picker, selected table row (`data-state=selected`).
- One flood per screen, assigned:
  - Household: the household hero card (already blue, becomes `.card-flood`).
  - Admin dashboard: HeroAlertCard becomes `.card-alert` only when it shows a problem; otherwise no flood.
  - Coach dashboard, Training, Situation detail, Account, two-step: none, or the single primary action card where one exists.

## 3. Accent bars

Search of every signed-in file found no colored left or top edge bars on cards, list items or menu items. The only `border-l` hits are on public pages (About.tsx, NewToCDBL.tsx timelines, neutral border color, out of scope) and the shadcn scroll-area track (transparent, not an accent). The active sidebar item uses a translucent white fill, not a bar; it becomes the blue flood. A rule comment is added to index.css forbidding edge accent bars.

Decision needed: the admin sidebar is currently solid CDBL Blue, so a blue flood on it would be invisible. Plan: sidebar becomes the card surface with `.tex-mesh` and dark text, active item is the blue flood. Mobile admin header stays the lit (blue, twill) header.

## 4. Icon cleanup

Global rules: lucide-react only, outline, `strokeWidth={1.75}`, 20px in tabs/sidebar, 16px inline, `currentColor`. Set once via a small `Icon` default in index.css (`.ngb svg.lucide { stroke-width: 1.75 }`) plus size classes at call sites. Status becomes `StatusChip` text. Empty states become one sentence (`EmptyStateBlock` loses its `icon` prop and tinted circle).

### Keep (they do a job)
- AdminSidebar: all nav-link icons (Database, Users, HelpCircle, Heart, Home, FileText, BarChart3, RefreshCw, MapPin, Calendar, User, ClipboardList, UsersRound, MessageSquare, UserCog, Settings2, Lock, Tag, CheckSquare, Coffee, Settings, Megaphone), ExternalLink, ChevronDown (section toggle). Resized to 20px.
- Commissioner.tsx: tab/nav icons (LayoutDashboard, ClipboardList, UsersRound, Users, UserPlus, CalendarDays, Megaphone, Settings). Trophy removed (banned), Standings tab text only.
- FamilyHeader: LogOut, UserRound (account link).
- Back buttons, ArrowLeft: DraftRoom, VenueEdit, FAQEdit, TeamEdit, SupportEdit, CoachEdit, DivisionEdit, PlayerEdit, ProgramEdit, SiteContentEdit, RequestDetail, DraftLive, DraftEdit, SituationDetail.
- Close/remove X: TeamDatesCard, TeamTasksCard, TeamEdit, DivisionEdit, CommitteeTasks, commissioner Coaches, commissioner Registrations (reject action), QuizCard (wrong-answer mark becomes text, see below).
- Search: commissioner Teams/Schedule/Registrations/Drafts/Coaches, admin Venues/Teams/Coaches/Players/SiteContent.
- Show/hide: SiteContent Eye/EyeOff, commissioner Registrations/Drafts Eye (view action).
- Download: GamesTab, GameChangerSync, Players, Reports. Upload: ScheduleImportDialog, GameChangerSync.
- ExternalLink: CalendarsTab, admin Schedule.
- Action buttons with labels: Plus (all "Add" buttons), Pencil/Edit, Trash2, Save, Send, RefreshCw (sync), Copy (PlayerEdit), Shuffle (DraftEdit), Filter, MoreHorizontal (row menu), Check (approve action in Registrations), CheckCheck (mark read, InboxTab).
- Player controls: SituationPlayer and SituationDetail Play, Pause, RotateCcw; DraftLive/Drafts/commissioner Drafts Play (start draft).
- Disclosure: ListRow ChevronRight, OutboxTab ChevronDown/Right, Divisions ChevronDown, UpcomingGamesCard ChevronRight, AdminNavGrid ChevronDown/Up.
- Loading: Loader2 spinner in TwoStepVerify, TwoStepSetup, HouseholdNew, HouseholdEditSheet.
- Household: Pencil (edit household), Phone, Mail (tap-to-call/email actions).

### Remove (decorative or status-as-icon)
- Household.tsx: MapPin, CalendarDays, Shield (title/empty-state icons).
- EmptyStateBlock: tinted circle icon slot (all callers).
- Account.tsx: Sun, Moon, Monitor in the picker (text labels Light / Dark / Device).
- Training.tsx: Target (title icon); LockKeyhole becomes a "Locked" chip. SituationDetail: Brain, LockKeyhole.
- PracticeSession: Dumbbell. QuizCard: Check/X result marks become "Correct" / "Not quite" chips; Eye kept only if it is the reveal button.
- coach/Dashboard: ClipboardList, Clock, CheckCircle (status) become chips; Play kept if it is a button.
- commissioner/Dashboard: Users, ClipboardList, UsersRound, CalendarDays, UserPlus stat-tile icons; ArrowRight removed (no arrows on links).
- commissioner/Standings: Trophy. commissioner/Settings: Clock, Users, Calendar heading icons. commissioner/Teams: Users, Settings heading icons. commissioner/Schedule: CalendarDays heading. commissioner/Communication: Users, Mail, History heading icons.
- admin/Dashboard: Users, Shield, Calendar, MessageSquare, UserPlus, CalendarPlus, MapPin, FileText, UserCog, ClipboardList (stat and quick-action tile icons). StatCard and QuickActionCard lose their icon prop and tinted squares.
- AdminNavGrid: all tile icons (Database, Users, HelpCircle, Heart, BookOpen, Shield, Calendar, MapPin, BarChart3, RefreshCw, MessageSquare, UserCog, Lock); tiles become text links.
- HeroAlertCard: AlertTriangle, Radio, MessageSquareWarning (flood conveys alert).
- SeasonCutoffBanner, EmailBounces, HealthTab, ComposeTab, Concessions, Venues, Players, Coaches, CommitteeTasks: AlertTriangle, AlertCircle, CheckCircle2, CircleCheck, CircleX, Info, Ban, Clock, Circle, Flag, Target become text chips or plain text.
- admin/Communication: Megaphone heading. InboxTab: Mail, Inbox (empty state). GamesTab, TeamDatesCard, Drafts, Reports, UpcomingGamesCard: Calendar, Users, MapPin, DollarSign, FileText, Package, Star (DraftEdit) label/heading icons.
- admin/Teams and Coaches: Users, Shield heading/stat icons. UserPlus kept where it labels an "Add" button.
- ScheduleImportDialog: FileSpreadsheet (decorative). GameChangerSync: Link2 (decorative).

Files with no lucide icons (Users, UserDetailSlider, Feedback, RoleRequestsCard, RegistrationCodes, RegistrationCodeEdit) are checked for emoji or tinted icon badges and cleaned if found.

## Acceptance checks
- Light and dark at 390, 768 and 1280: Household, Account, Training, Situation detail, two-step verify, coach dashboard, admin dashboard, one admin list page. No sideways scroll.
- Contrast at least 4.5:1, measured for body and muted text on card, mesh, flood and alert surfaces.
- At most one `.card-flood` or `.card-alert` per screen (scripted count).
- Seal and wordmark image files unchanged (hash compare).

## Technical details
- Files: src/index.css, tailwind.config.ts (no new tokens needed beyond CSS vars), src/components/ThemeScope.tsx, ui/card, ui/tabs, ui/table, ui/badge, AdminSidebar, family components (FamilyHeader, EmptyStateBlock, ListRow, StatusChip), Household, Account, Training, SituationDetail, training components, coach and commissioner pages, admin pages and dashboard components listed above.
- Undo: revert these files; no data or settings to restore.
- No database, auth, RLS, edge function or payment changes.
