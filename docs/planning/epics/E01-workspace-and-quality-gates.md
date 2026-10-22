# E01. Workspace and quality gates

- Status: Done
- Milestone: M0 Foundations
- PRD: none (platform)
- Depends on: none
- Design: none

## Goal

Every change to Daybook is type-checked, linted, formatted, tested and versioned by tooling from the first commit, so the standards in `CLAUDE.md` hold without relying on review.

## Scope

In:

- GitHub repository, `develop` and `main` branches with protection.
- Nx workspace with strict TypeScript, path aliases, the project tags and module-boundary rules.
- ESLint, Prettier, Husky, lint-staged, commitlint.
- Vitest, Testing Library, Playwright, Testcontainers and coverage gates.
- `nx release` configured for one product version from git tags.

Out:

- CI workflows that run these checks: E03-S04 and E03-S05.
- Any app code beyond what is needed to prove the tooling works (E02).

## Architecture touchpoints

- **Domain, application, data, API, web:** none; empty libraries only, created with Nx generators so tags are set.
- **Infra and observability:** none.
- **ADRs:** 0001, 0009, 0011, 0013, 0014, 0016. Q15 (npm or pnpm) is settled in S01 and recorded in ADR 0001.

## Risks and open questions

- Q15 (npm or pnpm) must be answered in S01; it affects every later command.
- Creating the GitHub repository is a manual step for the owner; S01 lists it as the first task.

## Stories

### E01-S01. Repository, branches and Nx workspace with enforced layers

- Status: Done
- Branch protection skipped by the owner (decision 2026-10-22); `develop` and `main` rules rely on discipline until revisited

So that every library has a place and a tag, and a wrong import between layers fails before review.

**Acceptance criteria**

- Given the repository on GitHub, when I look at branches, then `develop` is the default. Requiring a pull request and passing checks on `develop` and `main` was dropped by the owner.
- Given the workspace, when I run `nx show projects`, then every project from the module map exists with its `scope:*` and `type:*` tags.
- Given a file in `libs/shared/domain` that imports from `libs/api/infrastructure`, when I run lint, then it fails with a module-boundary error.
- Given a file in `libs/ui` that imports `@reduxjs/toolkit`, when I run lint, then it fails with a banned-import error.
- `tsconfig.base.json` has `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride` and `noFallthroughCasesInSwitch` on.
- `.nvmrc` pins Node.js 24.

**Tests first**

- Lint fixture tests: a throwaway file per forbidden edge (domain → infrastructure, ui → data-access, feature → infrastructure) must fail `nx lint`; a script in `tools/` asserts each failure and runs in CI.
- `nx run-many -t typecheck` passes on the empty workspace.

**Tasks**

- [x] Owner creates the GitHub repository; push `main`, create `develop`, set it as default (protection skipped)
- [x] Decide npm or pnpm (Q15); record in ADR 0001 and close Q15
- [x] Create the Nx workspace with `.nvmrc`, strict `tsconfig.base.json` and path aliases (`@daybook/*`)
- [x] Generate every app and library from the [module map](../../architecture/overview.md#module-map) with its tags
- [x] Configure `@nx/enforce-module-boundaries` depConstraints and `bannedExternalImports` per ADR 0011 and ADR 0013
- [x] Boundary fixture script in `tools/lint-fixtures/` with one case per forbidden edge
- [x] Update `docs/guides/development.md` commands from planned to real

### E01-S02. Lint, format and commit hooks

- Status: Done

So that style, naming and commit messages are fixed automatically or rejected at commit time.

**Acceptance criteria**

- Given a staged file with a single-letter variable, when I commit, then the commit is rejected by `id-length`.
- Given a staged, badly formatted file, when I commit, then Prettier reformats it and the commit goes through.
- Given a commit message `updated stuff`, when I commit, then commitlint rejects it; `feat(api): add health route` is accepted.
- Given any lint warning, when I run `nx affected -t lint`, then it exits non-zero (`--max-warnings 0`).
- `nx format:check` passes on the whole repo, including existing docs.

**Tests first**

- Lint fixture cases for `id-length`, `no-explicit-any`, `no-non-null-assertion` and `@typescript-eslint/no-floating-promises`, added to the S01 fixture script.
- A commitlint test file with accepted and rejected messages run by `commitlint --from`.

**Tasks**

- [x] Root ESLint flat config: `typescript-eslint` `strictTypeChecked` and `stylisticTypeChecked`, `id-length`, `max-lines` warning, `eslint-config-prettier`
- [x] Web overrides: `react`, `react-hooks`, `jsx-a11y`, `@next/eslint-plugin-next`; test overrides: `vitest`, `testing-library`, `playwright`, non-null allowed
- [x] Prettier config and `.prettierignore` (generated files, `design/canvas`)
- [x] Husky with lint-staged (`prettier --write`, `eslint --fix`) and commitlint (`@commitlint/config-conventional`, scopes from Nx projects)
- [x] Format the existing repo in one `style:` commit
- [x] Add fixture cases and the commitlint test to `tools/`

### E01-S03. Test tooling and coverage gates

- Status: Done

So that every project can be driven test-first at the right level from its first line of code.

**Acceptance criteria**

- Given any library, when I run `nx test <lib>`, then Vitest runs its `*.spec.ts` files.
- Given `libs/ui`, when a component test uses Testing Library and `user-event`, then it runs in a DOM environment.
- Given Docker is running, when I run `nx integration api-infrastructure`, then a DynamoDB Local container starts through Testcontainers and stops afterwards.
- Given coverage below 90% in a `type:domain` or `type:application` library, or below 80% elsewhere, when tests run with coverage, then the target fails.
- Given `apps/web-e2e`, when I run `nx e2e web-e2e`, then Playwright runs with `@axe-core/playwright` available.

**Tests first**

- A sample spec per level that is deleted once real tests exist: a domain unit test, a `libs/ui` component test, a Testcontainers test that creates and lists a table, and a Playwright test against a static page.

**Tasks**

- [x] Shared Vitest preset in `tools/vitest/` with coverage thresholds by tag
- [x] `jsdom` environment and Testing Library setup for `type:ui` and `type:feature` projects
- [x] `integration` target and a Testcontainers DynamoDB Local helper in a `testing` entry point of `libs/api/infrastructure`
- [x] Playwright config in `apps/web-e2e` and `apps/api-e2e`, with axe helper and a `baseURL` from env
- [x] Builder and in-memory fake conventions documented in `docs/guides/testing.md` with one example each

### E01-S04. Release versioning from commits

- Status: Done

So that the next product version can be computed from Conventional Commits without anyone editing a version number.

**Acceptance criteria**

- Given no tags, when I run the version dry-run, then the next version is `0.1.0`.
- Given tag `v0.1.0` and one `fix:` commit after it, when I run the dry-run, then it prints `0.1.1`; with a `feat:` commit it prints `0.2.0`; with `feat!:` it prints `0.2.0` while in `0.x`.
- Given the dry-run, when it finishes, then no files are changed and no commit or tag is created.
- Given a dev build, when I run `tools/version.ts --prerelease`, then it prints `X.Y.Z-dev.{shortSha}`.

**Tests first**

- A script test that creates a temporary git repo with tags and commits and asserts the computed versions above.

**Tasks**

- [x] Version rules in `tools/version/version.mts`: git tags as source of truth, Conventional Commits, no commit, no tag, no publish. `nx release version` was tried and dropped: it needs a package manifest per released project and a pre-existing tag, which this workspace does not have
- [x] `tools/version.ts` wrapping the dry-run, with `--prerelease` for dev builds
- [x] Script test with a temporary repository
- [x] Note the commands in `docs/guides/development.md`
