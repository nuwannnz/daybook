# Coding standards

Rules every change follows. Lint enforces what it can; review enforces the rest. Background: [ADR 0011](../decisions/0011-layered-architecture-ports-and-adapters.md).

## TypeScript

- `strict` plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`. No `any`; use `unknown` and parse with zod at boundaries.
- No non-null assertions (`!`) outside tests. No `as` casts except from a validated `unknown`.
- Prefer `type` for data shapes and `interface` for ports that adapters implement.
- Model states as discriminated unions (`{ status: 'done'; doneAt: string } | { status: 'open' }`), not optional flags.
- Domain functions are pure: no `Date.now()`, no randomness, no I/O. Inject `Clock` and `IdGenerator` ports.
- Return `Result<T, DomainError>` from domain and application code for expected failures; throw only for bugs.

## Naming

- Never use single-letter names, including loop variables, callbacks and generics: `tasks.map((task) => …)`, `for (const [index, block] of blocks.entries())`, `<TEntity>`.
- Files: `kebab-case.ts`; React components `PascalCase.tsx`; tests next to the code as `*.spec.ts(x)`.
- Commands are verbs (`CompleteTask`), queries are nouns (`TasksForDay`), ports describe the role (`TaskRepository`, `Clock`), adapters name the technology (`DynamoTaskRepository`, `SystemClock`).
- Booleans read as questions: `isTop3`, `hasProject`.

## Comments

- Only when the code can't say it: a non-obvious reason, a workaround with a link, a business rule's source (`// PRD TOD-5`).
- No comments restating the code, no JSDoc on obvious functions, no commented-out code, no banner comments.

## Architecture and patterns

- Depend on interfaces (ports), never on concrete adapters, outside the composition root.
- Use patterns where they solve a real problem:
  - **Repository** for persistence of each aggregate.
  - **Command** (and handler) for every state change, in both API and web; web commands are undoable.
  - **Query** objects for reads that cross aggregates.
  - **Facade** per web feature, hiding Redux and the API from components.
  - **Adapter** around every third-party SDK and runtime entry point.
  - **Strategy** for swappable algorithms (parsers, colour assignment).
  - **Factory** for building aggregates with valid defaults.
- Don't add a pattern without a second implementation or a test seam that needs it.
- One module, one reason to change. Keep files under about 200 lines; split by responsibility, not by size alone.
- Libraries expose a public API through `index.ts`; deep imports are blocked by lint.

## React

- No business logic in components. A component may hold purely visual state (hover, open/closed); everything else comes from a facade hook.
- `libs/ui` components are presentational: props in, callbacks out, no Redux, no fetching, no domain imports. Each one maps to a component in `design/system/components`.
- Feature containers live in `libs/web/feature-*`, call one facade and render `ui` components.
- Styles use the generated token CSS variables; never hard-code colours, radii or font sizes.
- Accessibility is part of done: real elements, labels, visible focus, 44 px targets, reduced motion.

## API

- Routes are thin: parse with the contract schema, build a command or query, call the handler, map the `Result` to a response.
- Every handler takes the authenticated `userId` from the request context, never from input.
- Errors are RFC 9457 problem details with a stable `code` from `libs/shared/contracts`.

## Lint and format

ESLint and Prettier ([ADR 0013](../decisions/0013-eslint-and-prettier.md)). The rules above that lint enforces:

| Rule                                       | Lint rule                                                             |
| ------------------------------------------ | --------------------------------------------------------------------- |
| No `any`, no non-null assertions           | `@typescript-eslint/no-explicit-any`, `no-non-null-assertion`         |
| No single-letter names                     | `id-length` with `min: 2`                                             |
| No floating promises or unsafe `any` flows | `typescript-eslint` `strictTypeChecked`                               |
| Layering and public APIs only              | `@nx/enforce-module-boundaries` with tags and `bannedExternalImports` |
| Accessible JSX                             | `jsx-a11y`                                                            |
| Small files                                | `max-lines` warning at 250                                            |

- Prettier formats everything; never hand-format or argue style in review.
- Staged files are formatted and lint-fixed on commit (Husky + lint-staged). CI fails on any lint warning or unformatted file.
- Disabling a rule needs an inline `eslint-disable-next-line <rule> -- <reason>`; blanket disables are rejected.

## Git

- Branch from `develop` (`feat/…`, `fix/…`, `docs/…`, `chore/…`); hotfixes branch from `main` ([ADR 0014](../decisions/0014-branching-and-deployment-flow.md)).
- Commit messages and pull request titles follow Conventional Commits, which set the version ([ADR 0016](../decisions/0016-semantic-versioning.md)): `feat(capture): add tag parsing`, `fix(api): reject a fourth Top 3 pin`. Imperative, lower case after the colon, under 72 characters. Mark breaking changes with `!` or a `BREAKING CHANGE:` footer.
- Commits keep tests green; a feature commit contains its tests.
- Update docs and ADRs in the same change as the behaviour.
