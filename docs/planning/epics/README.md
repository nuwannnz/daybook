# Epics

Work is broken down as **epic → story → task**, one file per epic in this folder. The [backlog](../backlog.md) holds the coarse list per milestone; each backlog line links to its epic once one exists.

- **Epic:** a feature area with one user outcome, tied to PRD IDs and one [roadmap](../roadmap.md) milestone. Usually three to eight stories.
- **Story:** a thin vertical slice someone can see working, with acceptance criteria and the tests to write first. Small enough to finish in about a day; there is no sizing, so anything bigger is split.
- **Task:** one TDD step in one layer, ordered outside-in (failing e2e → domain → application → adapter → API → web → UI → e2e green).

Files are named `E{NN}-short-title.md` and follow [TEMPLATE.md](TEMPLATE.md). Story ids are `E{NN}-S{NN}`; use them in branch names (`feat/e03-s02-top3-swap`) and as a `Refs: E03-S02` footer in commits.

Status values: epics go Proposed → Ready → In progress → Done; stories go Todo → In progress → Done. An epic is Ready once its dependencies are planned or done and no open question blocks its first story. A story waiting on a question carries a `Blocked by Q{N}` line.

To create or refine epics, run the `/plan-epic` skill with a milestone, PRD IDs or an idea, for example `/plan-epic M1` or `/plan-epic TOD-5 carry-over banner`.

## Index

| Epic                                        | Title                         | Milestone | PRD                              | Status      |
| ------------------------------------------- | ----------------------------- | --------- | -------------------------------- | ----------- |
| [E01](E01-workspace-and-quality-gates.md)   | Workspace and quality gates   | M0        | —                                | In progress |
| [E02](E02-local-walking-skeleton.md)        | Local walking skeleton        | M0        | —                                | Ready       |
| [E03](E03-aws-environments-and-delivery.md) | AWS environments and delivery | M0        | —                                | Ready       |
| [E04](E04-observability-baseline.md)        | Observability baseline        | M0        | NFR privacy, analytics transport | Ready       |
| [E05](E05-accounts-and-sign-in.md)          | Accounts and sign-in          | M0        | NFR privacy and security         | Ready       |
| [E06](E06-design-system-and-app-shell.md)   | Design system and app shell   | M0        | NAV-1, NAV-4                     | Ready       |
