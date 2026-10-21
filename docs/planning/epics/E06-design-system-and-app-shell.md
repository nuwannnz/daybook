# E06. Design system and app shell

- Status: Ready
- Milestone: M0 Foundations
- PRD: NAV-1, NAV-4; UX principles 6 and 7; "Undo over confirm"; NFR accessibility and responsiveness
- Depends on: E01, E02 (S03)
- Design: `design/system/tokens.json`, `design/system/components/Button`, `TextField`, `Icons`, `Banner`, `NavItem`, `ProjectChip`; `design/canvas/Main.dc.html` (sidebar)

## Goal

Every screen is built from Daybook's tokens and shared `libs/ui` components inside the real app layout, and any action can be undone from a toast, so feature epics only add their own pieces.

## Scope

In:

- Token CSS generated from `tokens.json` (light and dark), self-hosted Plus Jakarta Sans.
- Button, TextField, Icons and Banner in `libs/ui`.
- App shell: sidebar with Today, This week and Notes, a project list placeholder, and New project; collapse to a top menu below 820 px.
- Undo toast and undoable command bus.

Out:

- SegmentedTabs: moved to M3 (PRJ-4 is its first use).
- ProjectChip and the project list contents: the sidebar shows an empty project list until M3; ProjectChip arrives with capture tags (M1).
- Dark mode switching in the UI: v1 (P1). Tokens include dark values now so nothing changes later.
- ⌘K command bar: M5 (NAV-2).

## Architecture touchpoints

- **Domain:** none.
- **Web:** `libs/ui` components and token CSS; `libs/web/feature-shell` with `useShellFacade`; undo command bus and toast state in `libs/web/data-access`.
- **Infra and observability:** none.
- **ADRs:** 0002, 0011.

## Risks and open questions

- The NavItem README says the sidebar "stacks above content below 820px", while PRD NAV-4 says it "collapses into a top menu". The PRD wins: this epic builds a top menu, and the README needs updating (backlog item added).
- The Undo toast has no component card in `design/system/components`. It is built from the PRD (6 seconds, Undo action) and the design-system rules; the canvas should gain a card (backlog item added).
- Self-hosting the font requires the SIL Open Font License file in the repo.

## Stories

### E06-S01. Tokens and font in `libs/ui`

- Status: Todo

So that no component hard-codes a colour, size or radius, and the dark palette is ready when v1 needs it.

**Acceptance criteria**

- Given `tokens.json`, when the `ui:tokens` target runs, then it writes CSS custom properties for colour (light under `:root`, dark under `[data-theme="dark"]`), type, spacing, radius, shadow and size.
- Given a changed token value, when I rebuild, then the generated CSS changes with no hand edits.
- Given every documented text and background pair, when the contrast test runs, then each pair meets 4.5:1 in both themes (input borders meet 3:1).
- Given the web app, when it loads, then Plus Jakarta Sans 400, 500, 600 and 700 come from our own origin with `font-display: swap`.
- Lint fails on hex colours in `libs/ui` and `libs/web` source.

**Tests first**

- Unit: the generator maps a token fixture to the expected CSS.
- Unit: the contrast test over the real `tokens.json` pairs.

**Tasks**

- [ ] Generator in `tools/tokens/` and the `ui:tokens` Nx target, output checked into `libs/ui/src/styles/tokens.css`
- [ ] Contrast test reading the `usage` notes for pairs
- [ ] Font files and licence in `libs/ui/assets/fonts`; `@font-face` rules
- [ ] ESLint rule (`no-restricted-syntax`) for hex colours in TSX and CSS-in-TS
- [ ] Base styles: body ground, focus ring, reduced-motion media query

### E06-S02. Form components: Button, TextField, Icons, Banner

- Status: Todo

So that auth and feature screens are assembled from accessible, design-exact pieces.

**Acceptance criteria**

- Given Button, when rendered with each variant (primary, secondary, text, icon, large), then it matches its README; icon buttons require an `aria-label` at the type level.
- Given TextField with an error, when rendered, then `aria-invalid` is set and the message is linked with `aria-describedby`.
- Given Banner, when it is a notice, then it has `role="status"`; when it is an error, `role="alert"`.
- Given the icon set from the Icons card, when used decoratively, then each icon has `aria-hidden="true"`.
- Every interactive element is at least 44 × 44 px and shows the 2 px focus ring.
- Components take props and emit callbacks only; none imports Redux, the API or domain code (lint-enforced).

**Tests first**

- Component tests per component by role and name, covering variants and error states.
- An axe check over a test page rendering all variants.

**Tasks**

- [ ] Button, TextField and Banner in `libs/ui` from their READMEs and `bundle.css` classes
- [ ] Icons as typed React components generated from the Icons card SVGs
- [ ] A component gallery page in `apps/web` (dev builds only) for manual review against the canvas
- [ ] Axe test over the gallery in `apps/web-e2e`

### E06-S03. App shell with sidebar and mobile top menu

- Status: Todo
- PRD: NAV-1, NAV-4

As a busy individual contributor, I want the same sidebar on every view, so that Today, This week and Notes are always one click away.

**Acceptance criteria**

- Given a signed-in page at 1440 px, when it renders, then the 248 px sidebar shows Today, This week, Notes, a Projects heading with an empty list, and New project; the current view has `aria-current="page"`.
- Given a width below 820 px, when the page renders, then the sidebar collapses into a top menu that opens and closes with a button, Esc and a tap outside (UX principle 7).
- Given any width from 360 px to 2560 px, when content renders, then nothing scrolls sideways.
- Given keyboard only, when I tab through the shell, then every item is reachable in order with a visible focus ring.
- This week, Notes and New project routes show an empty-state placeholder until their milestones.

**Tests first**

- Component: NavItem current state; the top menu open, close, Esc and outside tap.
- e2e: navigate between views at desktop and 390 × 844 viewports; no horizontal scroll at 360 px; axe clean.

**Tasks**

- [ ] Failing `apps/web-e2e/src/shell/navigation.spec.ts`
- [ ] NavItem and a `TopMenu` sheet in `libs/ui`
- [ ] `useShellFacade` (current route, menu state) and the shell layout in `libs/web/feature-shell`
- [ ] Static routes `/today`, `/week`, `/notes` with placeholders
- [ ] e2e passes; axe clean

### E06-S04. Undo toast and command bus

- Status: Todo

So that every future write can be undone for 6 seconds instead of asking for confirmation.

**Acceptance criteria**

- Given an undoable command is executed, when it succeeds, then a toast shows its label and an Undo button for 6 seconds.
- Given I choose Undo within 6 seconds, when the toast handles it, then the command's `undo` runs and the toast closes.
- Given a second command runs while a toast is open, when it succeeds, then the toast shows the new command and the first can no longer be undone.
- Given `undo` fails, when the toast handles it, then an error banner explains it and nothing is retried silently.
- The toast is announced by screen readers (`role="status"`), reachable by keyboard, and its motion is off under reduced motion.

**Tests first**

- Unit: the command bus with fake timers (6 s expiry, replacement, undo once only).
- Component: toast rendering, Undo, keyboard and reduced motion.

**Tasks**

- [ ] `UndoableCommand` interface and command bus in `libs/web/data-access`
- [ ] Toast state slice and `useUndoFacade`
- [ ] `UndoToast` in `libs/ui`
- [ ] Mount the toast in the shell layout
- [ ] Dev-only demo command on the gallery page to exercise it in e2e
