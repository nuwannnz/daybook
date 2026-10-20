# Roadmap

Derived from the release plan in the [PRD](../product/PRD.md#release-plan). Dates are not set; each gate is a go / no-go review, and nothing moves on schedule alone.

## Phases

| Phase | Versions | Scope | Gate to exit |
| --- | --- | --- | --- |
| MVP (private beta) | 0.x | All P0: capture and tags, Today, carry-over, week board, projects, notes editor, online sync across devices, responsive web | No data lost while online; testers use it daily; AWS cost within $2/month |
| v1 (public launch) | 1.0.0 | All P1: offline mode and outbox sync, schedule and calendar, natural-language dates, weekly review, pinned decisions, note links, shortcuts, dark mode, desktop PWA | AA audit clean; retention on target; offline edits never lost |
| v1.1 | 1.1.0 | iOS and Android apps, native capture, to-do app imports, first AI agents (AI-1 to AI-3) | Mobile matches web for capture and Today |
| Later | 1.2.0 onward | P2 backlog, AI-4 onwards | — |

Versions follow [ADR 0016](../decisions/0016-semantic-versioning.md); `1.0.0` is cut by hand at the public launch gate.

Offline mode moved from MVP to v1 on 2026-10-20 ([ADR 0007](../decisions/0007-online-first-mvp-with-redux.md)).

## MVP milestones

Engineering order inside the MVP. Each milestone ends with its e2e journeys green on dev.

| # | Milestone | Requirements | Exit check |
| --- | --- | --- | --- |
| M0 | Foundations | — | Nx workspace, CI, infra spike findings recorded, dev and prod deployed, budget and alarms live, `ui` tokens and base components, sign up / sign in / reset |
| M1 | Capture and Today | CAP-1 to CAP-4, TOD-1 to TOD-5, TOD-8, NAV-1, NAV-4 | A tester runs a whole day from Today |
| M2 | This week | WK-1 to WK-5 | Five tray items scheduled in under 30 s by drag |
| M3 | Projects | PRJ-1 to PRJ-4, PRJ-7 | Project with three milestones and ten tasks set up by keyboard in under 3 minutes |
| M4 | Notes | NOT-1, NOT-2, NOT-4, NOT-5 | 5,000-word note types under 16 ms per key; reload loses ≤ 1 s |
| M5 | Search and mobile web | NAV-2, MOB-1 to MOB-3 | Capture on a phone in under 5 s |
| M6 | Beta hardening | NFRs | Export works, axe clean, performance budgets met, cost reviewed after a full month |

Detailed items are in the [backlog](backlog.md).
