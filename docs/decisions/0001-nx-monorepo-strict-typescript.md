# 0001. Nx monorepo with strict TypeScript

- Status: accepted
- Date: 2026-10-20

## Context

Daybook has a web app, an API, shared domain rules (Top 3 cap, day boundary, tag parsing), a shared UI library and infrastructure code. The rules must behave the same on client and server, and modules must stay easy to swap.

## Decision

- One Nx workspace holds every app and library, with npm workspaces. npm was chosen at scaffold time (Q15): it ships with Node 24, needs no extra install step in CI or Docker, and Nx works the same with either.
- `typescript` is pinned to 6.0.x until `typescript-eslint` supports 7.
- TypeScript everywhere, including infrastructure, with `strict: true` plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride` and `noFallthroughCasesInSwitch`.
- `any` is banned by lint (`@typescript-eslint/no-explicit-any: error`); unknown input is parsed with zod at the edges.
- Nx project tags and `@nx/enforce-module-boundaries` enforce the layering in [architecture/overview.md](../architecture/overview.md#module-map).
- `nx affected` drives CI so only changed projects are linted, tested and built.
- Lint and format tooling is in [0013](0013-eslint-and-prettier.md).

## Consequences

- Shared code is imported by path alias, never copied between apps.
- Layer violations (a React component importing a repository, the domain importing AWS SDK) fail lint, not review.
- Nx adds tooling to learn and upgrade; generators keep new libraries consistent.
