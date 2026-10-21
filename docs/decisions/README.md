# Architecture decision records

One file per decision, named `NNNN-short-title.md`. Copy [0000-template.md](0000-template.md). To change a decision, write a new ADR and mark the old one "superseded by NNNN".

| ADR                                                     | Title                                                    | Status                                    |
| ------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------- |
| [0001](0001-nx-monorepo-strict-typescript.md)           | Nx monorepo with strict TypeScript                       | Accepted                                  |
| [0002](0002-nextjs-static-export.md)                    | Next.js static export for the web app                    | Accepted                                  |
| [0003](0003-fastify-api-on-lambda-web-functions.md)     | Fastify API on Lambda Web Functions                      | Accepted                                  |
| [0004](0004-aws-cdk-for-infrastructure.md)              | AWS CDK for infrastructure                               | Accepted                                  |
| [0005](0005-dynamodb-single-table.md)                   | DynamoDB single-table design                             | Accepted                                  |
| [0006](0006-notes-as-yjs-documents.md)                  | Notes as Yjs documents with a TipTap editor              | Accepted                                  |
| [0007](0007-online-first-mvp-with-redux.md)             | Online-first MVP with Redux Toolkit; offline moves to v1 | Accepted                                  |
| [0008](0008-cognito-email-auth.md)                      | Amazon Cognito with email and password                   | Accepted                                  |
| [0009](0009-tdd-with-vitest-and-playwright.md)          | Test-driven development with Vitest and Playwright       | Accepted                                  |
| [0010](0010-observability-on-cloudwatch.md)             | Observability on CloudWatch, no third-party SDKs         | Accepted                                  |
| [0011](0011-layered-architecture-ports-and-adapters.md) | Layered architecture with ports and adapters             | Accepted                                  |
| [0012](0012-environments-and-cost-guardrails.md)        | Environments, region and cost guardrails                 | Accepted (deploy trigger amended by 0014) |
| [0013](0013-eslint-and-prettier.md)                     | ESLint for linting, Prettier for formatting              | Accepted                                  |
| [0014](0014-branching-and-deployment-flow.md)           | Branching: develop deploys dev, main deploys prod        | Accepted (tag format amended by 0016)     |
| [0015](0015-local-stack-with-docker-compose.md)         | Full local stack with Docker Compose                     | Accepted                                  |
| [0016](0016-semantic-versioning.md)                     | Semantic versioning from Conventional Commits            | Accepted                                  |
