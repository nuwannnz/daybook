# 0011. Layered architecture with ports and adapters

- Status: accepted
- Date: 2026-10-20

## Context

The codebase must be modular, loosely coupled and easy to swap: the API runtime, database, editor, auth provider and even the frontend framework could change. React components must hold no business logic, and shared components live in a UI library.

## Decision

Both the API and the web app follow the same layers, enforced by Nx tags:

| Layer            | Holds                                                                                                    | May depend on              |
| ---------------- | -------------------------------------------------------------------------------------------------------- | -------------------------- |
| `domain`         | Entities, value objects, pure rules (Top 3 cap, day boundary, tag and date parsing, progress)            | nothing                    |
| `contracts`      | zod schemas and DTO types shared by web and API                                                          | `domain`                   |
| `application`    | Commands, queries and their handlers; ports (repository, clock, id generator, auth, search)              | `domain`, `contracts`      |
| `infrastructure` | Adapters for ports: DynamoDB repositories, Cognito, Yjs store, logger                                    | `application`, `domain`    |
| `interface`      | Fastify routes and plugins, inside `apps/api`; RTK Query endpoints, facades and feature containers (web) | `application`, `contracts` |
| `ui`             | Presentational React components, design tokens                                                           | nothing outside `ui`       |

Patterns used where they fit:

- **Repository** for every aggregate (Task, Project, Note, WeeklyGoal); the application layer sees interfaces only.
- **Command** for every write. API: `CompleteTask`, `PinTop3`, `MoveTaskToDay`, handled by one handler each. Web: undoable command objects with `execute` and `undo`, powering the 6-second Undo toast.
- **Facade** per web feature (`useTodayFacade`, `useWeekFacade`) exposing view models and intents to components, hiding Redux and the API.
- **Adapter** for runtime entry points (Web Function, local, standard Lambda) and third-party SDKs.
- **Strategy** for parsers (tag, natural-language date) and project colour assignment.
- **Composition root** in each app's `main` wires adapters to ports by hand; no DI container.

### Which layers are libraries

`application` and `infrastructure` are separate Nx libraries (`libs/api/application`, `libs/api/infrastructure`), not folders inside `apps/api`:

- `@nx/enforce-module-boundaries` only checks imports between projects. As libraries, "application never imports infrastructure" fails lint; as folders, it would need a second tool.
- Several runtimes need commands and repositories without Fastify: the local seed and e2e fixtures (M0), import jobs (v1.1), the background capture tidier (AI-1) and the MCP server (AI-13).
- Nx caches and runs tests per library, so a route change does not re-run repository integration tests.

The Fastify routes and plugins stay inside `apps/api` (`src/http/`). They have one consumer, and splitting them out would add a project with no reuse.

## Consequences

- Swapping DynamoDB, Cognito, TipTap or the API runtime touches one adapter library and the composition root.
- Domain and application code is unit-tested without mocks of AWS; adapters get integration tests.
- More files per feature than a flat structure; generators keep this cheap.
