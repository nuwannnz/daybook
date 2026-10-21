# 0009. Test-driven development with Vitest and Playwright

- Status: accepted
- Date: 2026-10-20

## Context

TDD is mandatory. The project needs fast unit tests, integration tests against a real DynamoDB, component tests for the UI library, and end-to-end tests for web and API.

## Decision

- **Vitest** for unit, integration and component tests in every project (Nx `@nx/vite`).
- **React Testing Library** with `@testing-library/user-event` for components and feature hooks.
- **DynamoDB Local** (Docker, started by Testcontainers) for repository integration tests.
- **Fastify `inject`** for API route tests without a network.
- **Playwright** for end-to-end tests: `apps/web-e2e` drives the web app against the prod-like Docker Compose stack ([0015](0015-local-stack-with-docker-compose.md)); the same suite runs as a smoke set against dev after each deploy. `apps/api-e2e` exercises the deployed API contract.
- **CDK assertions** for infrastructure.
- **axe-core** (`@axe-core/playwright`) in e2e to catch WCAG 2.1 AA regressions.
- Coverage gates in CI: 90% lines for `domain` and `application` libraries, 80% elsewhere. Coverage is a floor, not the goal.

The working rules are in [guides/testing.md](../guides/testing.md).

## Consequences

- Every change starts with a failing test; reviews reject production code without one.
- Docker is a prerequisite for integration tests.
- E2E against dev requires a test user in the dev Cognito pool, created by a script and stored in SSM Parameter Store.
