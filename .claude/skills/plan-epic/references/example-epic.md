# Example epic (reference only)

This shows the depth and tone expected. It is not a real file in `docs/planning/epics/`; ids and dependencies are illustrative.

---

# E03. Top 3 focus

- Status: Ready
- Milestone: M1 Capture and Today
- PRD: TOD-2
- Depends on: E02 (tasks on Today)
- Design: `design/canvas/Main.dc.html` (Top 3 card); `design/system/components/Top3Card`

## Goal

A person can pin up to three of today's tasks as the day's focus, numbered and coloured by project, so the morning starts with a decision already made.

## Scope

In:

- Pin and unpin from Also today; numbered Top 3 card with project colour.
- Fourth pin opens a swap picker.
- `top3_set` analytics event.

Out:

- Reordering Top 3 by drag or Alt+↑/↓ (TOD-9, v1).
- `!` to mark a Top 3 candidate during capture (CAP-8, P2).
- Mobile Top 3 (MOB-1), in E09.

## Architecture touchpoints

- **Domain:** `Top3Slots` value object; `pin` and `unpin` return `Result` with `top3-full`.
- **Application:** `PinTop3`, `UnpinTop3`, `SwapTop3` commands; `Top3Repository` port.
- **Data:** item `TOP3#{date}`, access pattern 5; transaction with `size(taskIds) < 3` condition (data-model invariants).
- **API:** `PUT` and `DELETE /api/days/{date}/top3/{taskId}`, `POST /api/days/{date}/top3/swap`.
- **Web:** `useTop3Facade`; `Top3Card` and `TaskRow` from `libs/ui`; undoable `PinTop3Command`.
- **Infra and observability:** no new resources; `top3_set` event through the telemetry endpoint.
- **ADRs:** 0005, 0007, 0011.

## Risks and open questions

- Open question 1 (cap fixed at three, or a setting) could change the domain rule; keep the cap a constant in `Top3Slots` so a setting is a small change.

## Stories

### E03-S01. Pin and unpin a task to Top 3

- Status: Todo
- PRD: TOD-2

As a busy individual contributor, I want to pin up to three of today's tasks as my focus, so that I know what matters before I start.

**Acceptance criteria**

- Given two tasks on Today, when I pin both, then they appear in the Top 3 card numbered 1 and 2 in pin order, each with its project colour and name.
- Given a pinned task, when I unpin it, then it returns to Also today and the remaining Top 3 renumber.
- Given I pin a task, when I reload the app, then the Top 3 is unchanged.
- Given I pin a task, when the Undo toast shows and I choose Undo within 6 seconds, then the task is unpinned.
- The pin control is a button with an accessible name and a 44 × 44 px target.

**Tests first**

- e2e: pin two tasks, reload, both still numbered 1–2; unpin one, the other becomes 1.
- Unit: `Top3Slots.pin` keeps order, ignores a duplicate pin, rejects a fourth with `top3-full`.
- Integration: concurrent pins of a third and fourth task leave exactly three ids (transaction condition).

**Tasks**

- [ ] Failing e2e `apps/web-e2e/src/today/top3-pin.spec.ts`
- [ ] `Top3Slots` value object with unit tests in `libs/shared/domain`
- [ ] `pinTop3` and `top3` schemas in `libs/shared/contracts`
- [ ] `PinTop3` and `UnpinTop3` handlers, `Top3Repository` port and in-memory fake in `libs/api/application`
- [ ] `DynamoTop3Repository` transaction on `TOP3#{date}` and the task, with integration tests in `libs/api/infrastructure`
- [ ] `PUT` and `DELETE /api/days/{date}/top3/{taskId}` with `inject` tests, including `409 top3-full`, in `apps/api/src/http`
- [ ] RTK Query endpoints with optimistic patch and rollback; undoable `PinTop3Command` in `libs/web/data-access`
- [ ] `Top3Card` in `libs/ui` from the design component, props only, tests by role
- [ ] `useTop3Facade` and Today container wiring in `libs/web/feature-today`
- [ ] Emit `top3_set` (ids only) through `TelemetryClient`
- [ ] e2e passes; axe clean on Today; works in `docker compose up`

### E03-S02. Swap when pinning a fourth task

- Status: Todo
- PRD: TOD-2

As a busy individual contributor, I want to choose which focus task to drop when I pin a fourth, so that my Top 3 stays at three without a dead end.

**Acceptance criteria**

- Given three pinned tasks, when I pin a fourth, then a picker lists the three with "Swap out" and closes with Esc or a tap outside, changing nothing.
- Given the picker, when I choose a task, then it returns to Also today and the new task takes its number.
- The picker is reachable and operable by keyboard alone.

**Tests first**

- e2e: pin four tasks, swap out number 2, the new task shows as number 2.
- Unit: `Top3Slots.swap` replaces in place and rejects ids not in the slots.
- API: swap with a stale slot list returns `409` and the client refetches.

**Tasks**

- [ ] Failing e2e `apps/web-e2e/src/today/top3-swap.spec.ts`
- [ ] `Top3Slots.swap` with unit tests
- [ ] `SwapTop3` handler and `POST /api/days/{date}/top3/swap` with `inject` tests
- [ ] `SwapTop3Command` (undoable) and endpoint in `libs/web/data-access`
- [ ] Swap picker sheet in `libs/ui` (focus trap, Esc closes), tests by role
- [ ] Facade opens the picker on `top3-full` instead of showing an error
- [ ] e2e passes; axe clean
