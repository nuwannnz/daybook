# E00. Epic title

- Status: Proposed
- Milestone: M0 Foundations
- PRD: CAP-1, CAP-2
- Depends on: none
- Design: `design/canvas/Main.dc.html` (section name); `design/system/components/ComponentName`

## Goal

One or two sentences on the outcome for the person using Daybook, in the PRD's words.

## Scope

In:

- What this epic delivers.

Out:

- What it deliberately leaves out, and which epic or phase picks it up.

## Architecture touchpoints

- **Domain:** rules and value objects added or changed.
- **Application:** commands, queries and ports.
- **Data:** access patterns from [data-model.md](../../architecture/data-model.md), new items or keys.
- **API:** routes.
- **Web:** facades, feature containers, `libs/ui` components (new or reused).
- **Infra and observability:** new AWS resources, metrics, alarms, analytics events. Check the free-tier budget.
- **ADRs:** decisions this epic relies on or needs.

## Risks and open questions

- Anything that could block or reshape the epic. Copy real questions to [open-questions.md](../open-questions.md).

## Stories

### E00-S01. Story title

- Status: Todo
- PRD: CAP-1

As a person who …, I want …, so that ….

**Acceptance criteria**

- Given …, when …, then ….

**Tests first**

- e2e: the journey that fails until the story is done.
- Unit: the rules to pin down.
- Integration: the adapter behaviour to prove.

**Tasks**

- [ ] Failing e2e scenario in `apps/web-e2e/…`
- [ ] …
- [ ] e2e passes; axe clean; docs updated
