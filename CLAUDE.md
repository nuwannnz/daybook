# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Daybook: notes, daily plan, weekly plan and projects in one app. The source of truth for requirements is [docs/product/PRD.md](docs/product/PRD.md). Where the PRD and the design canvas disagree, the PRD wins.

## Stack

Nx monorepo, strict TypeScript. Next.js static export (React, Redux Toolkit + RTK Query) on S3 + CloudFront; Fastify API on AWS Lambda Web Functions; DynamoDB single table; Cognito email auth; TipTap + Yjs notes; AWS CDK; us-east-1; dev and prod; $2/month total budget. Details: [docs/architecture/overview.md](docs/architecture/overview.md) and the ADRs in [docs/decisions/](docs/decisions/README.md).

## Layout

- `docs/`: all planning and documentation (see [docs/README.md](docs/README.md))
- `design/`: design system tokens, components and canvas screens
- `apps/`, `libs/`: application code, once scaffolded ([module map](docs/architecture/overview.md#module-map))
- `docker/`, `compose.yaml`: local stack, once scaffolded

## Rules

- **Branches.** Work branches from `develop`; `develop` deploys dev, `main` deploys prod ([ADR 0014](docs/decisions/0014-branching-and-deployment-flow.md)). Never commit straight to either.
- **Conventional Commits.** Commit messages and PR titles use `type(scope): subject`; they drive semantic versioning ([ADR 0016](docs/decisions/0016-semantic-versioning.md)).
- **Lint and format.** ESLint and Prettier must pass with no warnings ([ADR 0013](docs/decisions/0013-eslint-and-prettier.md)).
- **Runs locally.** The whole app must keep working under `docker compose up` with no AWS access ([ADR 0015](docs/decisions/0015-local-stack-with-docker-compose.md)).
- **TDD always.** Write a failing test first, then the code. Unit and e2e tests are both required ([docs/guides/testing.md](docs/guides/testing.md)).
- **Strict types.** No `any`, no non-null assertions outside tests; parse unknown input with zod.
- **Loose coupling.** Depend on interfaces (ports); concrete adapters are wired only in each app's composition root. Keep modules swappable.
- **Patterns where they fit.** Repository, Command, Facade, Adapter, Strategy, Factory ([docs/guides/coding-standards.md](docs/guides/coding-standards.md)).
- **No business logic in React components.** Components call a facade hook; shared presentational components go in `libs/ui`.
- **No single-letter variable names**, including callbacks, loop indexes and generics.
- **Comments only when needed.** No comments that restate code.
- **Respect the budget.** Check [infrastructure.md](docs/architecture/infrastructure.md#cost-estimate) and the free-tier limits in [observability.md](docs/architecture/observability.md) before adding AWS resources, metrics or alarms.
- **No user content in logs, metrics or analytics.**

## Conventions

- Put every new planning or documentation file under `docs/`, not the repo root.
- Record significant technical choices as ADRs in `docs/decisions/` using the template there.
- Keep the docs index in `docs/README.md` up to date when adding files.
- Plan work as epic → story → task files in `docs/planning/epics/` using the `plan-epic` skill (`.claude/skills/plan-epic/`). Build from a story's task list, tick tasks as they land, and update story and epic status.
- Use design tokens from `design/system/tokens.json`; do not hard-code colours.
- Commit author: `nuwankarunarathna504@gmail.com`.

## Commands

None yet. The planned Nx commands are in [docs/guides/development.md](docs/guides/development.md#commands); move them here once they work.
