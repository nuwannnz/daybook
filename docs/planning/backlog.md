# Backlog

Ordered by [roadmap](roadmap.md) milestone. Every item starts with a failing test ([testing guide](../guides/testing.md)). IDs in brackets refer to the [PRD](../product/PRD.md).

Before building, break items into [epics, stories and tasks](epics/README.md) with `/plan-epic` (for example `/plan-epic M1`). Each line links to its epic once one exists.

## M0 Foundations

- [ ] Create the GitHub repository, push `main`, create `develop` as the default branch, protect both ([ADR 0014](../decisions/0014-branching-and-deployment-flow.md)) → [E01](epics/E01-workspace-and-quality-gates.md)
- [ ] Scaffold the Nx workspace with strict TypeScript and the tags from the [module map](../architecture/overview.md#module-map) → [E01](epics/E01-workspace-and-quality-gates.md)
- [ ] ESLint (type-aware rules, module boundaries, `id-length`), Prettier, Husky + lint-staged ([ADR 0013](../decisions/0013-eslint-and-prettier.md)) → [E01](epics/E01-workspace-and-quality-gates.md)
- [ ] commitlint in the `commit-msg` hook and a pull request title check; `nx release` configured as one fixed group with git-tag versions ([ADR 0016](../decisions/0016-semantic-versioning.md)) → [E01](epics/E01-workspace-and-quality-gates.md)
- [ ] Add Vitest, Testing Library, Playwright and Testcontainers (DynamoDB Local) with coverage gates → [E01](epics/E01-workspace-and-quality-gates.md)
- [ ] `libs/shared/domain`: `Clock`, `IdGenerator` (ULID), `Result` type → [E02](epics/E02-local-walking-skeleton.md)
- [ ] `apps/infra`: account stack (budget, OIDC, deploy roles) and empty per-environment stacks → [E03](epics/E03-aws-environments-and-delivery.md)
- [ ] Infrastructure spike: hello-world Fastify on a Web Function behind CloudFront OAC; record findings in ADR 0003 ([checklist](../architecture/infrastructure.md#infrastructure-spike-first-engineering-task)) → [E03](epics/E03-aws-environments-and-delivery.md)
- [ ] Data stack: DynamoDB table and indexes from a table definition shared with tests and the local seed → [E02](epics/E02-local-walking-skeleton.md)
- [ ] Docker Compose local stack: DynamoDB Local, `db-init` seed, API, web, Caddy proxy; dev and prod-like modes ([ADR 0015](../decisions/0015-local-stack-with-docker-compose.md)) → [E02](epics/E02-local-walking-skeleton.md)
- [ ] Observability stack: log retention, dashboard, alarms, SNS topic; `Logger` and `Metrics` ports with pino and EMF adapters → [E04](epics/E04-observability-baseline.md)
- [ ] GitHub Actions: PR checks (format, lint, typecheck, tests, e2e on prod-like Compose), deploy dev on merge to `develop`, prod on merge to `main` with approval, post-deploy smoke tests → [E03](epics/E03-aws-environments-and-delivery.md)
- [ ] `libs/ui`: generate token CSS from `design/system/tokens.json`; self-host Plus Jakarta Sans → [E06](epics/E06-design-system-and-app-shell.md)
- [ ] `libs/ui`: Button, TextField, Icons, Banner, NavItem → [E06](epics/E06-design-system-and-app-shell.md)
- [ ] Web shell: sidebar layout, responsive collapse below 820 px [NAV-1, NAV-4] → [E06](epics/E06-design-system-and-app-shell.md)
- [ ] Auth: Cognito stack, `AuthService` port with Amplify and local adapters, sign up, verify email, sign in, sign out, reset password screens → [E05](epics/E05-accounts-and-sign-in.md)
- [ ] API auth plugin: `TokenVerifier` port with Cognito and local adapters, token from `X-Daybook-Token`, set `userId`; problem-details error handler → [E05](epics/E05-accounts-and-sign-in.md)
- [ ] Telemetry endpoint and web `TelemetryClient` with error boundary and Web Vitals → [E04](epics/E04-observability-baseline.md)
- [ ] Inject `DAYBOOK_VERSION` at build; expose it in `/api/health`, logs, telemetry and settings → [E02](epics/E02-local-walking-skeleton.md), [E04](epics/E04-observability-baseline.md)
- [ ] Undo command bus and Undo toast → [E06](epics/E06-design-system-and-app-shell.md)
- [ ] Design canvas: sign-up "Check your email" code step, reset code field, Undo toast card; NavItem README to say "top menu" below 820 px (NAV-4)
- [ ] Tracing with OpenTelemetry to X-Ray (waits on Q12)

## M1 Capture and Today

- [ ] Domain: `parseCapture` with case-insensitive project tags, Inbox fallback [CAP-3, CAP-4]
- [ ] API: tasks create, update, complete, reopen, delete with versioned writes
- [ ] API: change feed `GET /api/changes` and 5 s visible-tab polling in the web app
- [ ] `ui`: CaptureBar, TaskRow; capture facade; ⌘K / Ctrl+K focus [CAP-1, CAP-2]
- [ ] Today header with day navigation and ISO week; domain day boundary at 04:00 and ISO week [TOD-1]
- [ ] Top 3 with the three-pin cap and swap picker; `TOP3#{date}` transaction [TOD-2]
- [ ] Also today list with done count and progress [TOD-3, TOD-4]
- [ ] Carry-over banner with bring and dismiss; once-per-day decision [TOD-5]
- [ ] Daily note preview and lazy creation (plain text until M4 editor lands) [TOD-8]
- [ ] Empty states and microcopy for Today

## M2 This week

- [ ] Week header and Monday start; Sunday setting [WK-1]
- [ ] Weekly goals per project with progress [WK-2]
- [ ] Plan board with project-coloured cards and today highlight [WK-3]
- [ ] Drag between days; mobile long-press "Move to" [WK-4]
- [ ] Not scheduled yet tray with Do today [WK-5]

## M3 Projects

- [ ] Create project with name only and next free pastel [PRJ-1]
- [ ] Project header with goal, target date, phase and progress [PRJ-2]
- [ ] Milestones accordion with status and tasks [PRJ-3]
- [ ] Overview, Plan and Notes tabs; `libs/ui` SegmentedTabs [PRJ-4]
- [ ] Archive project; delete with confirmation [PRJ-7]

## M4 Notes

- [ ] Yjs note store: updates endpoint, state-vector fetch, snapshot and link extraction
- [ ] `NoteEditor` (TipTap + Yjs) with headings, lists, checklists, marks, links and Markdown shortcuts [NOT-2]
- [ ] IndexedDB buffer for unsent note updates; autosave with no Save button [NOT-5]
- [ ] Notes list with filters and two-pane layout [NOT-1]
- [ ] Group chip and Linked footer [NOT-4]
- [ ] Replace the M1 daily note preview with the editor

## M5 Search and mobile web

- [ ] `SearchIndex` port with DynamoDB filtered-query adapter; command bar [NAV-2]
- [ ] Mobile Today with Now card [MOB-1]
- [ ] Floating capture button and bottom sheet with Task / Note toggle [MOB-2]
- [ ] Bottom tab bar [MOB-3]

## M6 Beta hardening

- [ ] Account export to Markdown and JSON
- [ ] Offline banner; writes disabled while offline
- [ ] Performance budgets checked in CI (bundle size, Lighthouse on Today)
- [ ] Full axe pass and manual screen-reader check
- [ ] Move Cognito email to SES if beta sign-ups exceed 50 emails a day
- [ ] Terms and Privacy pages linked from sign-up (waits on Q19)
- [ ] Runbooks for each alarm in `docs/guides/runbooks.md`
- [ ] Cost review after one full billing month; update the [cost estimate](../architecture/infrastructure.md#cost-estimate)

## v1 (not yet scheduled)

- [ ] Offline mode: IndexedDB persistence of the cache, command outbox, replay on reconnect
- [ ] All P1 requirements from the PRD
- [ ] Google sign-in through Cognito
- [ ] Passwordless "Email me a sign-in link" (waits on Q21)
