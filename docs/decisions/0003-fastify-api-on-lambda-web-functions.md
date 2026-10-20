# 0003. Fastify API on Lambda Web Functions

- Status: accepted
- Date: 2026-10-20

## Context

The API needs an HTTP framework with schema validation, good TypeScript support and fast tests. AWS Lambda Web Functions (announced 2026-10-12) run a normal port-listening Node.js server on Lambda, without adapters, and can sit behind CloudFront as an origin.

Facts at launch that shape this decision:

- Node.js 24 on arm64 only; environments are fixed at 2 vCPU / 2 GB.
- Billing is active CPU time plus memory held for the whole life of an environment, including idle time between requests, plus $0.30 per million requests. No free tier is published.
- An idle environment is reaped after roughly 5 minutes, so each burst of use keeps about 2 GB warm for 5–10 minutes.
- No Lambda extensions API (telemetry is shipped from inside the process), no WebSockets, half-duplex request bodies, about 1 s to shut down after SIGTERM.
- CloudFormation resources `AWS::Lambda::WebFunction`, `AWS::Lambda::WebFunctionRevision`, `AWS::Lambda::WebFunctionEndpoint`; CDK has no L2 or CloudFront origin construct yet.

## Decision

- The API is a Fastify app in `apps/api` running on a Lambda Web Function in us-east-1, with an `IamAuth` endpoint reached only through CloudFront (origin access control of type `lambda`, signing `always`).
- The Fastify app is built by a port-agnostic `buildApp(dependencies)` function. Entry points are thin adapters:
  - `main.ts` listens on `PORT`. The same file runs in the Web Function, in Docker ([0015](0015-local-stack-with-docker-compose.md)) and on a developer machine; configuration picks the adapters.
  - A `main.lambda.ts` (via `@fastify/aws-lambda`) can be added to run on a standard Lambda Function URL without touching routes.
- Request and response bodies are validated with zod schemas from `libs/shared/contracts`.

## Consequences

- **Cost risk.** At about $0.026 per warm environment-hour, the $2 cap covers roughly 68 warm hours per month across both environments. Steady daily use by a few people will exceed it. Guardrails are in [0012](0012-environments-and-cost-guardrails.md). If the forecast exceeds $2 for two months in a row, a new ADR switches the entry point to standard Lambda, which stays inside the always-free tier.
- Because the user's `Authorization` header conflicts with CloudFront's SigV4 signing, the client sends its Cognito token in `X-Daybook-Token`. Payload-hash requirements for signed POST/PUT bodies are checked during the infrastructure spike and handled in the web API client if needed.
- Tracing and metrics are emitted from the process (see [0010](0010-observability-on-cloudwatch.md)).
- Being a new service, CDK constructs are written in-house as an L1 wrapper and must be re-checked as AWS ships L2 support.
