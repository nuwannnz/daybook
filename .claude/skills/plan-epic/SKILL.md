---
name: plan-epic
description: Break Daybook work into epics, stories and TDD tasks as markdown files in docs/planning/epics/. Use this whenever the user wants to plan, break down, slice, groom or refine work, whether it's a roadmap milestone (M0–M6), PRD requirement IDs (CAP-3, TOD-5, WK-2…), a backlog item, or a feature idea. Also use it when they ask for epics, stories, tickets or tasks, want to split a story that got too big, or ask what to build next, even if they never say "epic".
---

# Plan epics, stories and tasks

Turn a slice of Daybook's scope into epic files that someone (often Claude in a later session) can pick up and build test-first without re-reading the whole PRD. The files live in `docs/planning/epics/`, follow `docs/planning/epics/TEMPLATE.md`, and are indexed in `docs/planning/epics/README.md`.

## What the user can ask for

- **A milestone** (`M1`): every epic needed to finish it.
- **PRD IDs or a feature** (`TOD-5`, "weekly review"): one epic, or new stories in an existing epic.
- **Refine** an existing epic or story: split it, add stories, re-order tasks, update status.
- **What next**: the first Todo story in a Ready or In progress epic whose dependencies are Done.

If the request doesn't map clearly to one of these, ask one short question rather than guessing the scope.

## Read before writing

The breakdown is only as good as its sources, so read these first. Skim, don't dump them into the reply.

1. `docs/product/PRD.md`: the requirement rows, their priority and the acceptance lines for the area. **The PRD wins** over everything else, including the design canvas.
2. `docs/planning/roadmap.md` and `docs/planning/backlog.md`: the milestone, its exit check and the backlog lines this work covers.
3. `docs/planning/epics/README.md` and the existing epic files: avoid duplicates, find dependencies, and take the next free `E{NN}`.
4. `docs/architecture/overview.md` (module map, flows) and `docs/architecture/data-model.md` (keys, access patterns, invariants): the layers and data each story touches.
5. The screen's canvas file (`design/canvas/*.dc.html`; the table in `design/README.md` maps screens to files) and the `README.md` of each component in `design/system/components/` it uses. These hold the exact copy, layout and variants.
6. `docs/planning/open-questions.md` and the ADRs the area depends on: blockers and decisions already made.

## How to slice

**Epics** group stories behind one user outcome in one milestone. Name them by outcome ("Top 3 focus"), not layer ("Top 3 API"). An epic that needs more than about eight stories is two epics.

**Stories** are vertical slices: each one goes from the UI (or the API, for platform work) down to storage and can be shown working on its own. A story that is "the domain part" or "the API part" of something is a task, not a story. Split a story when any of these hold:

- it would take more than about a day;
- it covers PRD IDs with different behaviours;
- it has more than about twelve tasks (a full-stack story naturally has ten or eleven);
- its acceptance criteria describe several separate journeys.

Common splits: happy path first, then the edge rule (cap, swap, conflict); desktop then mobile; read before write; empty state as its own story when it has real behaviour. A read-only slice is fine when it is useful to see on its own (a banner that tells you what's left over). If it would only make sense once the actions exist, merge it into the first write story instead.

Write the story as "As a … I want … so that …" using a PRD persona. For platform stories in M0 that have no end user, write "So that … (developer or operator outcome)" instead of forcing a persona.

**Acceptance criteria** are Given / When / Then lines, taken from the PRD's acceptance text wherever it exists, and testable as written. Include the non-functional checks that apply: latency budgets, 44 px targets, keyboard path, reduced motion, no content in analytics.

**Tests first** names the failing e2e journey and the unit and integration tests that pin the rules. The project is strictly TDD (`docs/guides/testing.md`), so this section is what makes a story buildable.

**Tasks** are checkboxes in outside-in TDD order, each naming the library or file it touches:

1. Failing e2e scenario (`apps/web-e2e` or `apps/api-e2e`).
2. Domain rule with unit tests (`libs/shared/domain`).
3. Contracts (`libs/shared/contracts`).
4. Application command or query, port and in-memory fake (`libs/api/application`).
5. Adapter with integration test (`libs/api/infrastructure`).
6. Route with `inject` tests (`apps/api/src/http`).
7. Web data-access: RTK Query endpoint, optimistic update, undoable command (`libs/web/data-access`).
8. Presentational component in `libs/ui`, matching `design/system/components`.
9. Facade and container (`libs/web/feature-*`). Business logic stays out of components.
10. Telemetry or analytics event if the PRD lists one; metric or alarm only if the free-tier budget allows.
11. Architecture doc updates as their own task when the story changes them: new keys or access patterns in `data-model.md`, new routes or flows in `overview.md`.
12. e2e green, axe clean, Docker stack still works.

Skip steps that don't apply rather than writing "n/a" tasks. No sizing or estimates. The team chose none; size is controlled by splitting.

## Respect the project's rules

These come from `CLAUDE.md` and the ADRs. Bake them into tasks rather than restating them:

- Ports and adapters: new persistence or external calls get a port in `application` and an adapter in `infrastructure`.
- Undo over confirm (PRD UX): every user write (complete, move, delete, dismiss, pin) needs an undoable web command and an inverse path in the API, so plan both in the same story. Only deleting a project asks for confirmation.
- Shared UI goes in `libs/ui`; feature containers only call a facade.
- Anything that adds an AWS resource, custom metric or alarm gets a task to check `docs/architecture/infrastructure.md#cost-estimate` and the free-tier counts in `docs/architecture/observability.md`.
- New technical decisions get an ADR task, not a silent choice.
- If the PRD is ambiguous or conflicts with the design or architecture, don't settle it silently. Add the question to the epic's risks and to `docs/planning/open-questions.md`, then:
  - When a reasonable reading exists, use it so the criteria stay testable. Mark the line `(assumes Q17)` and keep the rule in one domain function, so a different answer is a small change.
  - When no reading is safe (the answer changes what gets built, not just a detail), leave that behaviour out of scope with a pointer to the question.
  - When the question blocks the epic's core outcome, stop and ask the user before writing the epic.

## Ids, status and dependencies

- **Epic ids** are assigned in creation order (`E01`, `E02`, …), whatever the milestone. Ids never change, even if milestones are re-ordered.
- **Epic status:** write new epics as **Proposed**. An epic is **Ready** when its dependencies are Done or planned in Ready epics, and no open question blocks its first story; say so when you set it. **In progress** and **Done** follow its stories.
- **Story status:** Todo, In progress, Done. A story waiting on an open question stays Todo with a `Blocked by Q17` line under its status.
- **Dependencies:** list epic ids where they exist. For work that isn't planned yet, name the backlog item briefly with its milestone (`M0 backlog: Undo command bus`), at most one line each. If an epic depends on more than three unplanned items, suggest planning the earlier milestone first; that's usually the better order.
- **Open questions:** add each one to the matching table in `open-questions.md` (Product or Technical), numbered after the highest number in the file.

## Workflow

1. Read the sources above for the requested scope.
2. **When planning a whole milestone or more than one epic, show an outline first:** epic titles with one-line goals and their story titles. Wait for the user's go-ahead. Re-slicing an outline is cheap; re-writing five full epic files is not. For a single epic or a refinement, go straight to writing.
3. Write each epic as `docs/planning/epics/E{NN}-kebab-title.md` from the template. See `references/example-epic.md` for the expected depth and tone.
4. Update the index table in `docs/planning/epics/README.md` (one row per epic).
5. In `docs/planning/backlog.md`, append a link to each backlog line the epic covers, for example `→ [E03](epics/E03-top-3-focus.md)`. Add backlog lines under the right milestone for new work the epics uncovered but left out of scope, noting the question they wait on (`waits on Q18`) instead of an epic link.
6. Add new questions to `docs/planning/open-questions.md`.
7. Reply with a short summary: epics and story counts, dependencies, open questions raised, and the suggested first story. Don't paste the files back.

When refining, edit in place: keep existing ids stable, append new stories with the next free `S{NN}`, and mark a split story's remainder as a new story rather than renumbering.

When the user asks what's next, read the epic files, apply the rule from "What the user can ask for", and answer with the story id, title and its first unchecked task.

## Writing style

Plain, specific, short. Use the PRD's terms (Top 3, carry-over, tray) and the glossary in `docs/product/glossary.md`. Reference requirement IDs instead of repeating requirement text. No filler sections: if an epic has no risks, write "None known".
