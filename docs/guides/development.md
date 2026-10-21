# Development guide

How to work on Daybook locally. The workspace is not scaffolded yet; commands marked _planned_ become real when the M0 backlog items land.

## Prerequisites

- Docker Desktop (or another engine with Docker Compose v2). This is enough to run the whole app.
- Node.js 24 (matches the Lambda Web Functions runtime), via `nvm` or `fnm` with the repo's `.nvmrc`, to run tests and tooling outside Docker.
- Playwright browsers (`npx playwright install`) for e2e tests.
- AWS CLI v2 and an SSO profile for the Daybook account, only to deploy or read dev logs.

## Workspace layout

```text
apps/
  web/            Next.js static export
  web-e2e/        Playwright journeys
  api/            Fastify: main.ts, composition root, src/http routes and plugins
  api-e2e/        API contract tests
  infra/          AWS CDK app
libs/
  shared/domain         Pure business rules
  shared/contracts      zod schemas shared by web and API
  shared/observability  Logger and metrics ports and adapters
  api/application       Commands, queries, ports
  api/infrastructure    DynamoDB, table definition, Yjs store, token verifiers
  web/data-access       Redux store, RTK Query, API and auth clients
  web/feature-*         Facades and containers per area
  web/editor            TipTap + Yjs note editor
  ui                    Shared presentational components and tokens
docker/
  api.Dockerfile        Node 24 image running apps/api main.ts
  web.Dockerfile        next dev (dev mode) and static export build (prod-like)
  Caddyfile             Local stand-in for CloudFront routing
compose.yaml            Full local stack, dev mode
compose.prodlike.yaml   Override: built images, static web, used by CI e2e
```

Module rules and tags: [architecture overview](../architecture/overview.md#module-map). Code rules: [coding standards](coding-standards.md).

## Run the whole app with Docker

_Planned_ ([ADR 0015](../decisions/0015-local-stack-with-docker-compose.md)).

```sh
docker compose up
```

Open `http://localhost:8080`, sign up with any email, and use the app. Nothing touches AWS.

| URL                     | Service                                                                       |
| ----------------------- | ----------------------------------------------------------------------------- |
| `http://localhost:8080` | The app through the Caddy proxy (`/api/*` to the API, everything else to web) |
| `http://localhost:3333` | API directly                                                                  |
| `http://localhost:8000` | DynamoDB Local                                                                |
| `http://localhost:8001` | DynamoDB admin UI (`docker compose --profile tools up`)                       |

- **dev mode** (default): source is bind-mounted; the API restarts on change and Next.js hot-reloads.
- **prod-like mode**: `docker compose -f compose.yaml -f compose.prodlike.yaml up --build` runs the production API bundle and serves the static export through Caddy, the same shape as CloudFront. CI runs e2e against this.
- Reset all local data: `docker compose down -v`.
- Password reset codes and verification codes appear in the API logs (`docker compose logs -f api`).

### Configuration

Set in `compose.yaml`; override in a git-ignored `.env`.

| Variable                                    | Local default          | Meaning                                                                   |
| ------------------------------------------- | ---------------------- | ------------------------------------------------------------------------- |
| `ENV`                                       | `local`                | `local`, `dev` or `prod`                                                  |
| `AUTH_MODE`                                 | `local`                | `local` (dev JWT signer) or `cognito`; `local` is refused when `ENV=prod` |
| `TABLE_NAME`                                | `daybook-local`        | DynamoDB table                                                            |
| `DYNAMODB_ENDPOINT`                         | `http://dynamodb:8000` | Unset in AWS                                                              |
| `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID` | unset                  | Needed only with `AUTH_MODE=cognito` (use the dev pool)                   |
| `LOG_LEVEL`                                 | `debug`                | pino level; logs are pretty-printed locally                               |

## Commands

_Planned._ These will be wired as Nx targets and listed in `CLAUDE.md`.

| Task                                              | Command                                       |
| ------------------------------------------------- | --------------------------------------------- |
| Install                                           | `npm ci`                                      |
| Run everything in Docker                          | `docker compose up`                           |
| Run API on the host (needs DynamoDB from Compose) | `npx nx serve api`                            |
| Run web on the host (proxies `/api`)              | `npx nx dev web`                              |
| Unit and component tests                          | `npx nx affected -t test`                     |
| Integration tests (Testcontainers)                | `npx nx affected -t integration`              |
| E2E tests against the Compose stack               | `npx nx e2e web-e2e`                          |
| Lint and type-check                               | `npx nx affected -t lint typecheck`           |
| Format, check formatting                          | `npx nx format:write`, `npx nx format:check`  |
| Build everything                                  | `npx nx run-many -t build`                    |
| Synthesize infra                                  | `npx nx run infra:synth --configuration=dev`  |
| Deploy dev (normally CI)                          | `npx nx run infra:deploy --configuration=dev` |

## Branches and environments

[ADR 0014](../decisions/0014-branching-and-deployment-flow.md):

| Branch           | Environment                                 |
| ---------------- | ------------------------------------------- |
| feature branches | your machine (Docker)                       |
| `develop`        | dev, on every merge                         |
| `main`           | prod, on every merge, after manual approval |

## Workflow

1. Pick an item from the [backlog](../planning/backlog.md) and branch from `develop` (`feat/capture-bar`).
2. Start the stack with `docker compose up`.
3. Write a failing e2e or unit test from the PRD acceptance criteria ([testing guide](testing.md)).
4. Work red → green → refactor; keep commits green. The pre-commit hook formats and lint-fixes staged files.
5. Run `nx affected -t lint typecheck test` before pushing.
6. Open a pull request into `develop`; update docs and ADRs in the same pull request when behaviour or decisions change.
7. Merging deploys dev. A release pull request from `develop` into `main` deploys prod.

## Definition of done

- Tests at the right levels, written first, passing in CI.
- Lint and format checks pass with no warnings.
- Works in the Docker stack, not just on the host.
- No business logic in React components; new shared UI is in `libs/ui`.
- Keyboard and screen-reader paths work; axe reports no violations.
- No new custom metric or alarm without checking the [free-tier budget](../architecture/observability.md#metrics).
- Logs carry no user content.
- Docs updated.
