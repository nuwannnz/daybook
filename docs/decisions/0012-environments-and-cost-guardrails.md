# 0012. Environments, region and cost guardrails

- Status: accepted
- Date: 2026-10-20

## Context

Daybook needs dev and prod environments on AWS for at most $2 per month in total, with no custom domain. Lambda Web Functions bill for idle warm memory ([0003](0003-fastify-api-on-lambda-web-functions.md)), so cost must be watched, not assumed.

## Decision

- **Region:** us-east-1 for everything (Web Functions launch region; Cognito, CloudFront and Budgets all available).
- **Accounts:** one AWS account holding both environments, separated by stack names, resource prefixes (`daybook-dev-*`, `daybook-prod-*`) and an `env` tag. Revisit with an AWS Organization when there is a team or paying users.
- **URLs:** the default CloudFront domain per environment; no Route 53 hosted zone.
- **Deploys:** GitHub Actions with OIDC into a deploy role. Merges to `develop` deploy dev; merges to `main` deploy prod after manual approval ([0014](0014-branching-and-deployment-flow.md)).
- **Guardrails:**
  - One AWS Budget for the account at $2 per month, alerting by email at 50% and 80% actual and 100% forecast.
  - Cost allocation tag `env` activated so dev and prod show separately in Cost Explorer.
  - DynamoDB maximum on-demand throughput set per table.
  - Log retention set on every log group; no KMS customer-managed keys; SSM Parameter Store (standard) instead of Secrets Manager.
  - Web Function max environments capped per environment once AWS throttling behaviour settles (left unset at first; see [infrastructure.md](../architecture/infrastructure.md#lambda-web-functions)).
- **Exit plan:** if the forecast exceeds $2 for two consecutive months, switch the API entry point to standard Lambda behind a Function URL (always-free tier) via a new ADR.

## Consequences

- The estimated monthly cost and its assumptions are in [architecture/infrastructure.md](../architecture/infrastructure.md#cost-estimate); update them after the first full month of billing.
- One account means a mistake in dev IAM can reach prod; deploy roles are scoped by resource prefix to limit that.
