# 0004. AWS CDK for infrastructure

- Status: accepted
- Date: 2026-10-20

## Context

Infrastructure must be code, reproducible for dev and prod, and reviewed like the rest of the repo. Options were AWS CDK and Terraform.

## Decision

- Use AWS CDK v2 in TypeScript, as the Nx project `apps/infra`.
- One CDK app, parameterised by environment (`dev`, `prod`), deploys stacks per environment: `Daybook-{env}-Data`, `Daybook-{env}-Auth`, `Daybook-{env}-Api`, `Daybook-{env}-Web`, `Daybook-{env}-Observability`. A single `Daybook-Account` stack holds the AWS Budget and alert topic.
- Lambda Web Functions use the CloudFormation L1 resources wrapped in our own `DaybookWebFunction` construct until CDK ships an L2.
- Stateful resources (DynamoDB table, Cognito user pool) use `RemovalPolicy.RETAIN` in prod and `DESTROY` in dev.
- Infrastructure is tested with CDK assertions (`Template.fromStack`) for resource properties and snapshot tests for drift.

## Consequences

- The same language and toolchain as the app; shared types (env config, table key names) are imported, not duplicated.
- CDK bootstrap creates an asset bucket and ECR repository per account and region; their cost is negligible but counted in the budget.
- Terraform remains an option only through a new ADR.
