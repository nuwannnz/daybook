# Testing

TDD is mandatory ([ADR 0009](../decisions/0009-tdd-with-vitest-and-playwright.md)). No production code is written without a failing test that needs it.

## The loop

1. **Red.** Write the smallest test that describes the next behaviour, usually from a PRD acceptance criterion. Run it and see it fail for the right reason.
2. **Green.** Write the simplest code that passes.
3. **Refactor.** Clean up names, duplication and structure with tests green.
4. Commit when green. Commit messages may reference the requirement (`TOD-5`).

Start each feature from the outside in: a failing Playwright scenario for the user journey, then unit tests drive the domain, application and UI pieces until the scenario passes.

## Test levels

| Level          | Tool                                     | Where                                                 | What it covers                                                                                                          | Speed |
| -------------- | ---------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----- |
| Unit           | Vitest                                   | `libs/shared/domain`, `libs/api/application`, facades | Pure rules, command handlers with in-memory fakes                                                                       | ms    |
| Component      | Vitest + Testing Library                 | `libs/ui`, `libs/web/feature-*`                       | Rendering, interaction, a11y roles, facade wiring with a test store                                                     | ms    |
| Integration    | Vitest + DynamoDB Local (Testcontainers) | `libs/api/infrastructure`                             | Repository queries, conditional writes, transactions                                                                    | s     |
| API            | Vitest + Fastify `inject`                | `apps/api` (`src/http/`)                              | Routes, auth plugin, validation, problem details                                                                        | ms    |
| Infrastructure | Vitest + CDK assertions                  | `apps/infra`                                          | Resource properties, IAM scope, retention, alarms                                                                       | s     |
| End-to-end     | Playwright + axe                         | `apps/web-e2e`, `apps/api-e2e`                        | User journeys against the prod-like Docker Compose stack in CI, and a smoke set against dev after deploy; accessibility | s–min |

## Rules

- Test behaviour through public APIs, not private functions or implementation details.
- Fakes over mocks: every port has an in-memory fake in a `testing` entry point of its library (`@daybook/api-application/testing`). Mock only at system edges you don't own.
- Use builders for test data (`aTask().scheduledOn('2026-10-20').asTop3().build()`); no shared mutable fixtures.
- Time is injected: tests set the `Clock`, never the system time. Day-boundary tests cover 03:59 and 04:00.
- Component tests query by role and label (`getByRole('checkbox', { name: 'Draft brief' })`), which also checks accessibility.
- Each Playwright test creates its own user data through the API and cleans up; tests run in parallel.
- No snapshot tests of React output. CDK template snapshots are allowed for drift detection.
- Flaky tests are fixed or deleted within a day, never retried into green.

## From acceptance criteria to tests

Each PRD acceptance line becomes at least one test. Examples:

| PRD                                                        | Test                                                                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| CAP-3: a tag files the item and is stripped from the title | Unit: `parseCapture('Draft brief #Website', projects)` returns the project id and title `Draft brief`        |
| CAP acceptance: tag matches case-insensitively             | Unit: `#WEBSITE` and `#website` resolve to the same project                                                  |
| TOD-2: a fourth pin asks which to swap                     | Component: pinning a fourth task opens the swap picker; API: fourth pin without swap returns `409 top3-full` |
| TOD-5: banner never appears twice for a day                | Integration: second `CARRYOVER#{date}` put fails the condition; e2e: reload after dismiss shows no banner    |
| WK-2: progress agrees with the project page                | Unit: both views use `projectProgress()`; e2e compares the two numbers                                       |
| NOT-5: autosave, no Save button                            | e2e: type, reload, text is there; no button named Save exists                                                |

## Commands

Added once the workspace is scaffolded; see [development.md](development.md#commands).
