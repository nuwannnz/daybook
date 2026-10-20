# 0013. ESLint for linting, Prettier for formatting

- Status: accepted
- Date: 2026-10-20

## Context

Every change needs automatic lint and format checks. The candidates were ESLint with Prettier, and Biome (one fast tool for both). The layering in [0011](0011-layered-architecture-ports-and-adapters.md) is enforced through Nx's `@nx/enforce-module-boundaries`, which is an ESLint rule, and strict typing ([0001](0001-nx-monorepo-strict-typescript.md)) benefits from type-aware lint rules.

## Decision

- **ESLint** (flat config, `@nx/eslint`) for linting, with:
  - `typescript-eslint` `strictTypeChecked` and `stylisticTypeChecked` (catches floating promises, unsafe `any` flows, needless conditions).
  - `@nx/enforce-module-boundaries` with tag constraints and `bannedExternalImports` (for example, `type:domain` bans `@aws-sdk/*`, `react` and `fastify`; `type:ui` bans `@reduxjs/*` and `@aws-sdk/*`).
  - `id-length` (`min: 2`, `properties: 'never'`) so single-letter names fail lint.
  - `@typescript-eslint/no-explicit-any` and `no-non-null-assertion` as errors (non-null allowed in tests).
  - `react`, `react-hooks`, `jsx-a11y` and `@next/eslint-plugin-next` for the web; `vitest`, `testing-library` and `playwright` plugins for tests.
  - `max-lines` warning at 250 lines per file.
  - `eslint-config-prettier` last, so ESLint never argues with the formatter.
- **Prettier** for formatting all TypeScript, JSON, YAML, CSS and Markdown, through `nx format`. Settings: `printWidth: 100`, `singleQuote: true`, `trailingComma: 'all'`.
- **Type checking** is its own Nx target (`typecheck`, `tsc --noEmit`) so lint stays fast.
- **Git hooks:** Husky with lint-staged runs Prettier and `eslint --fix` on staged files at commit.
- **CI gate:** `nx format:check` and `nx affected -t lint typecheck` on every pull request; warnings fail CI (`--max-warnings 0`).

## Consequences

- One rule set enforces types, naming, layering and accessibility, using Nx's built-in support and generator defaults.
- ESLint with type-aware rules is slower than Biome; Nx caching and `affected` keep it to changed projects.
- Biome can replace Prettier for formatting later without touching lint, if formatting speed becomes a problem.
