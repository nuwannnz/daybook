# 0015. Full local stack with Docker Compose

- Status: accepted
- Date: 2026-10-20

## Context

The whole app must run locally with Docker and Docker Compose, without an AWS account, so development, demos and end-to-end tests don't depend on the cloud. Cognito has no free local emulator with full SRP support.

## Decision

- `compose.yaml` at the repo root runs the full app at `http://localhost:8080`. The `docker/` folder holds Dockerfiles and the proxy config.
- Services:

  | Service          | Image                             | Role                                                                                                                                |
  | ---------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
  | `dynamodb`       | `amazon/dynamodb-local`           | Database, data in a named volume                                                                                                    |
  | `db-init`        | API image, one-shot               | Creates the table from the same definition CDK uses and seeds a demo user                                                           |
  | `api`            | `docker/api.Dockerfile` (Node 24) | Fastify on port 3333, the same `main.ts` that runs in the Web Function                                                              |
  | `web`            | `docker/web.Dockerfile`           | `next dev` on port 3000 (dev mode only)                                                                                             |
  | `proxy`          | Caddy                             | Plays CloudFront: `/api/*` to `api`, everything else to `web` (dev) or the static export (prod-like), with the same `.html` rewrite |
  | `dynamodb-admin` | `aaronshaf/dynamodb-admin`        | Optional table browser, `tools` profile                                                                                             |

- Two modes:
  - **dev** (`docker compose up`): source bind-mounted, API and web hot-reload.
  - **prod-like** (`docker compose -f compose.yaml -f compose.prodlike.yaml up --build`): built images only. The API image runs the production bundle, and Caddy serves the static export. CI runs Playwright e2e against this mode.
- **Local auth.** The API's `TokenVerifier` port and the web's `AuthService` port get local adapters when `AUTH_MODE=local`. The API issues and verifies JWTs signed by a dev key and serves its own JWKS. Sign-up, sign-in and reset screens work end to end with any email; reset codes are logged to the API console. The API refuses to start with `AUTH_MODE=local` when `ENV=prod`, and the Web Function bundle compiles the local adapter out.
- `AUTH_MODE=cognito` with dev pool ids lets the local stack test real Cognito flows when needed.
- Integration tests keep using Testcontainers, not Compose, so each test run gets a clean database.

## Consequences

- One command runs the whole app offline from AWS, close to the deployed shape (same API entry, same routing rules).
- The real Cognito adapter is only exercised against dev, so the post-deploy smoke suite must cover sign-in.
- Docker Desktop (or a compatible engine) becomes a prerequisite.
