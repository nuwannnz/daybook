# 0014. Branching: develop deploys dev, main deploys prod

- Status: accepted
- Date: 2026-10-20
- Amends: the deploy trigger in [0012](0012-environments-and-cost-guardrails.md)

## Context

Each environment should map to a branch so it is always clear what is running where, and prod changes go through an explicit release step.

## Decision

| Branch | Purpose | Deploys to | Updated by |
| --- | --- | --- | --- |
| `develop` | Integration; GitHub default branch | dev, on every merge | Squash-merged pull requests from feature branches |
| `main` | Production | prod, on every merge, after manual approval in the GitHub `prod` environment | Release pull requests from `develop` (merge commit), or hotfix pull requests |
| `feat/*`, `fix/*`, `docs/*`, `chore/*` | Work in progress | none | Branched from `develop` |
| `hotfix/*` | Urgent prod fix | none | Branched from `main`; after merging to `main`, `main` is merged back into `develop` |

- Both `develop` and `main` are protected: pull requests only, all checks green, no force pushes.
- A successful prod deploy tags the merge commit with its semantic version and creates a GitHub release ([0016](0016-semantic-versioning.md)).
- Release pull requests use merge commits, not squash, so `main` and `develop` share history and back-merges stay clean.

## Consequences

- dev always runs `develop`, and prod always runs `main`.
- Releases are pull requests, so the diff going to prod is reviewable in one place.
- Hotfixes need a back-merge; forgetting it makes the next release revert the fix. The release workflow checks that `main` is an ancestor of `develop` before opening a release pull request.
