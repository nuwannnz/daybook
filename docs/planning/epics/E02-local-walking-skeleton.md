# E02. Local walking skeleton

- Status: Ready
- Milestone: M0 Foundations
- PRD: none (platform)
- Depends on: E01
- Design: none (a placeholder page until E06)

## Goal

The whole app, with web, API and database, runs locally with `docker compose up` in the same shape as AWS, so every later story has a real stack to drive its e2e tests against.

## Scope

In:

- `buildApp` and the single `main.ts` entry, with configuration parsing and problem-details errors.
- `Clock`, `IdGenerator` and `Result` in `libs/shared/domain`.
- `GET /api/health` with version and a table check.
- Shared table definition, DynamoDB Local, `db-init`.
- Static export shell page that calls the API.
- Compose dev and prod-like modes behind Caddy, and a Playwright smoke test.

Out:

- Auth: E05. Health stays unauthenticated.
- Structured logging and telemetry beyond Fastify defaults: E04.
- The day boundary and ISO week: moved to the M1 Today header (TOD-1).

## Architecture touchpoints

- **Domain:** `Clock`, `IdGenerator` (ULID), `Result`.
- **Application:** `HealthCheck` query; `TableProbe` port.
- **Data:** the table definition from [data-model.md](../../architecture/data-model.md) (keys, `GSI1`, `GSI2`, TTL) exported from `libs/api/infrastructure` for CDK, tests and `db-init`.
- **API:** `GET /api/health`.
- **Web:** `apps/web` static export with one page; `libs/web/data-access` HTTP client adapter.
- **Infra and observability:** `compose.yaml`, `compose.prodlike.yaml`, `docker/`. No AWS.
- **ADRs:** 0002, 0003, 0005, 0011, 0015, 0016.

## Risks and open questions

- DynamoDB Local differs from DynamoDB in some transaction and limit behaviour; integration tests that depend on those edges must also run against dev (E03).

## Stories

### E02-S01. API health endpoint through the production entry point

- Status: Todo

So that the API runs from one port-agnostic entry and reports which version is running.

**Acceptance criteria**

- Given the API is started with `node main.js` and `PORT=3333`, when I call `GET /api/health`, then it returns `200` with `{ status, version, time }`, where `version` comes from `DAYBOOK_VERSION`.
- Given `DAYBOOK_VERSION` is unset, when the API starts locally, then `version` is `0.0.0-local`.
- Given a required environment variable is missing, when the API starts, then it exits with a message naming the variable.
- Given an unknown route, when I call it, then the response is RFC 9457 problem details with `code: not-found`.
- Given `SIGTERM`, when requests are in flight, then Fastify closes within 800 ms.

**Tests first**

- Unit: `Result` helpers; `SystemClock` and a `FixedClock` fake; `UlidGenerator` produces sortable ids.
- API: `inject` tests for health, unknown route and config validation against `buildApp` with fakes.
- e2e (`apps/api-e2e`): `GET /api/health` against a running process.

**Tasks**

- [ ] Failing `apps/api-e2e/src/health.spec.ts`
- [ ] `Result`, `Clock`, `FixedClock`, `IdGenerator` with unit tests in `libs/shared/domain`
- [ ] Health response and problem-details schemas in `libs/shared/contracts`
- [ ] `HealthCheck` query with `TableProbe` port and fake in `libs/api/application`
- [ ] Config parsing with zod and `buildApp(dependencies)` in `apps/api`
- [ ] Problem-details error handler and not-found handler in `apps/api/src/http`
- [ ] `main.ts` listening on `PORT`, with graceful shutdown; composition root
- [ ] esbuild bundle target producing one file for the Web Function and Docker
- [ ] e2e passes

### E02-S02. Shared table definition and a health check that reaches DynamoDB

- Status: Todo

So that local, test and AWS tables are created from one definition and health shows whether the database is reachable.

**Acceptance criteria**

- Given DynamoDB Local is running and `db-init` has run, when I call health, then `checks.table` is `ok`.
- Given DynamoDB is unreachable, when I call health, then it returns `503` with `checks.table: unavailable` and no stack trace.
- Given the table definition, when CDK, Testcontainers setup and `db-init` create a table, then all three produce the same keys, indexes and TTL attribute.
- The probe result is cached for 60 s.

**Tests first**

- Integration: `DynamoTableProbe` against Testcontainers reports ok, and reports unavailable when the container is stopped.
- Unit: the definition matches the data-model table (keys, two GSIs, TTL attribute) as a typed constant.

**Tasks**

- [ ] Extend the health e2e for `checks.table`
- [ ] `daybookTableDefinition` in `libs/api/infrastructure` from [data-model.md](../../architecture/data-model.md)
- [ ] `DynamoTableProbe` adapter with 60 s cache and integration tests
- [ ] `db-init` script that creates the table and seeds a demo user (local auth arrives in E05; seed only data for now)
- [ ] Wire the probe in the composition root with `DYNAMODB_ENDPOINT`
- [ ] e2e passes

### E02-S03. Static web shell that talks to the API

- Status: Todo

So that the web app builds as a static export and reaches the API through `/api`, as it will behind CloudFront.

**Acceptance criteria**

- Given `nx build web`, when it finishes, then the output is static files only (`output: 'export'`) with `today.html` and `index.html`.
- Given the web app and API are running, when I open `/today`, then a placeholder page shows "Daybook" and the API version from health.
- Given the API is down, when I open `/today`, then the page still renders and shows "Can't reach Daybook right now" in an error banner style.
- The page passes axe with no violations.

**Tests first**

- Component: the placeholder container renders version and the error state from a stubbed `HttpClient`.
- e2e: open `/today`, version text visible.

**Tasks**

- [ ] Failing `apps/web-e2e/src/smoke/shell.spec.ts`
- [ ] `HttpClient` port and fetch adapter (sends `X-Request-Id`) in `libs/web/data-access`
- [ ] Redux store and RTK Query base API with the health endpoint
- [ ] Next.js app with static export, `unoptimized` images, `/today` page and dev proxy of `/api` to `localhost:3333`
- [ ] Placeholder container in `libs/web/feature-shell` using a facade
- [ ] e2e passes; axe clean

### E02-S04. Compose dev mode behind a local CloudFront stand-in

- Status: Todo

So that one command runs the whole app at `localhost:8080` with hot reload and no AWS access.

**Acceptance criteria**

- Given a fresh clone with Docker running, when I run `docker compose up`, then `http://localhost:8080/today` shows the shell page with the API version within 2 minutes.
- Given the stack is running, when I edit an API route or a web component, then the change is live without restarting Compose.
- Given `http://localhost:8080/today`, when Caddy serves it, then `/api/*` goes to the API and other paths go to the web app, matching the CloudFront behaviours.
- Given `docker compose --profile tools up`, when I open `localhost:8001`, then the DynamoDB admin UI shows the table.
- Given `docker compose down -v`, when I start again, then the table is recreated empty.

**Tests first**

- A CI-runnable script `tools/compose-smoke.sh` that starts Compose, waits for health through `localhost:8080/api/health`, and tears down.

**Tasks**

- [ ] `docker/api.Dockerfile` (Node 24, dev target with watch, prod target with the bundle)
- [ ] `docker/web.Dockerfile` (dev target `next dev`)
- [ ] `docker/Caddyfile` with `/api/*` routing and the `.html` rewrite
- [ ] `compose.yaml` with `dynamodb`, `db-init`, `api`, `web`, `proxy`, `dynamodb-admin` (`tools` profile), named volume, health checks and `depends_on`
- [ ] `.env.example` with the variables from the development guide
- [ ] `tools/compose-smoke.sh`
- [ ] Update `docs/guides/development.md` from planned to real

### E02-S05. Prod-like Compose mode with a Playwright smoke test

- Status: Todo

So that e2e tests run against the same API bundle and static files that ship to AWS.

**Acceptance criteria**

- Given `docker compose -f compose.yaml -f compose.prodlike.yaml up --build`, when it starts, then the API runs the production bundle and Caddy serves the static export with no Node web server.
- Given the prod-like stack, when I run `nx e2e web-e2e`, then the shell smoke test passes against `localhost:8080`.
- Given the prod-like stack, when `ENV=prod` and `AUTH_MODE=local` are set together, then the API refuses to start (guard added now, adapter in E05).

**Tests first**

- The existing shell and health e2e specs, pointed at the prod-like stack through `baseURL`.

**Tasks**

- [ ] `docker/web.Dockerfile` prod target that builds the static export into the Caddy image
- [ ] `compose.prodlike.yaml` override
- [ ] Startup guard for `ENV=prod` with `AUTH_MODE=local`, with a unit test
- [ ] Nx target `e2e-prodlike` that starts the stack, runs Playwright and tears down
- [ ] e2e passes against prod-like mode
