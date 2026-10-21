# 0016. Semantic versioning from Conventional Commits

- Status: accepted
- Date: 2026-10-20
- Amends: the release tag format in [0014](0014-branching-and-deployment-flow.md)

## Context

Releases need a version that says what changed, shows up in logs, the health endpoint and the UI, and can be traced back to commits. Daybook is one product: web, API and infrastructure deploy together, and no library is published.

## Decision

- **One version for the whole product** following [SemVer 2.0.0](https://semver.org), tagged `vMAJOR.MINOR.PATCH` on `main`. Libraries and apps are not versioned separately.
- **Phase mapping:**

  | Product phase    | Versions                    |
  | ---------------- | --------------------------- |
  | MVP private beta | `0.x.y` (starts at `0.1.0`) |
  | v1 public launch | `1.0.0`                     |
  | v1.1             | `1.1.0` onward              |

  While in `0.x`, breaking changes bump the minor version. `1.0.0` is cut by hand at the public launch gate.

- **Conventional Commits** decide the bump:

  | Commit                                                             | Bump                         |
  | ------------------------------------------------------------------ | ---------------------------- |
  | `fix:`, `perf:`                                                    | patch                        |
  | `feat:`                                                            | minor                        |
  | `!` after the type, or a `BREAKING CHANGE:` footer                 | major (minor while in `0.x`) |
  | `docs:`, `test:`, `refactor:`, `build:`, `ci:`, `chore:`, `style:` | none                         |

  "Breaking" means a change that breaks stored data, the public API contract or a user-visible workflow.

- **Enforcement:** commitlint (`@commitlint/config-conventional`) runs in the Husky `commit-msg` hook, and CI checks pull request titles, because feature pull requests are squash-merged and the title becomes the commit. Scopes are Nx project or area names (`feat(capture): …`, `fix(api): …`).
- **Tooling:** `nx release` with a single fixed release group, git tags as the source of truth for the current version, and no version-bump commits or `CHANGELOG.md` file. The changelog lives in GitHub releases. This keeps `main` and `develop` free of release commits and back-merges.
- **Release flow** on merge to `main`:
  1. Compute the next version from commits since the last tag (`nx release version --dry-run`).
  2. Build with that version injected as `DAYBOOK_VERSION`.
  3. Wait for manual approval, then deploy prod.
  4. On success only, create the tag and a GitHub release with the generated changelog.
- **dev builds** use the next version as a prerelease: `X.Y.Z-dev.{shortSha}`. dev is never tagged.
- **Where the version shows:** `GET /api/health`, every API log line (`version`), frontend telemetry events, the Web Function revision description, the CloudWatch dashboard deploy annotations, and the settings screen.

## Consequences

- The version is derived, never edited by hand (except for cutting `1.0.0`), and every release has a changelog.
- Commit messages are a contract; a wrong type produces a wrong version. Reviews check pull request titles.
- A failed prod deploy creates no tag, so the next attempt recomputes the same version.
