# Contributing

- Branch from `develop`; use short names like `feat/capture-bar` or `docs/roadmap`. Hotfixes branch from `main` as `hotfix/…` ([ADR 0014](docs/decisions/0014-branching-and-deployment-flow.md)).
- Open pull requests into `develop`. Releases are pull requests from `develop` into `main`.
- Write the failing test first ([testing guide](docs/guides/testing.md)).
- Use [Conventional Commits](https://www.conventionalcommits.org) for commit messages and pull request titles (`feat(capture): add tag parsing`); they decide the next semantic version ([ADR 0016](docs/decisions/0016-semantic-versioning.md)). Keep subjects imperative and under 72 characters.
- Commits are formatted and lint-fixed by the pre-commit hook; CI fails on any lint warning.
- Update docs in the same change as the behaviour they describe.
- Record significant technical decisions as an ADR in `docs/decisions/`.
