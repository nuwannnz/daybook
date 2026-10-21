# Infrastructure and cost

AWS us-east-1, one account, two environments (`dev`, `prod`), all defined in CDK under `apps/infra`. Decisions: [0003](../decisions/0003-fastify-api-on-lambda-web-functions.md), [0004](../decisions/0004-aws-cdk-for-infrastructure.md), [0012](../decisions/0012-environments-and-cost-guardrails.md).

## Stacks per environment

| Stack                         | Resources                                                                                                                                       |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `Daybook-{env}-Data`          | DynamoDB table `daybook-{env}`, S3 bucket for oversized note documents                                                                          |
| `Daybook-{env}-Auth`          | Cognito user pool and web app client (SRP, no secret), password policy, verification email                                                      |
| `Daybook-{env}-Api`           | Lambda Web Function, revision and `IamAuth` endpoint; IAM role scoped to the table and bucket; log groups with retention                        |
| `Daybook-{env}-Web`           | S3 bucket for the static build (private), CloudFront distribution with two behaviours, response headers policy, deployment of `apps/web` output |
| `Daybook-{env}-Observability` | Dashboard, alarms, SNS email topic, log metric filters                                                                                          |

Account-level stack `Daybook-Account`: AWS Budget, budget SNS topic, GitHub OIDC provider and the deploy roles.

## CloudFront

| Path     | Origin                                                  | Cache                                                                             | Notes                                                                        |
| -------- | ------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `/api/*` | Web Function endpoint, OAC (type `lambda`, sign always) | Disabled; forward query strings and the `X-Daybook-Token`, `X-Request-Id` headers | Methods: all                                                                 |
| `/*`     | S3 build bucket, OAC                                    | Hashed assets 1 year, HTML no-cache                                               | CloudFront Function rewrites `/today` to `/today.html` for the static export |

The response headers policy sets a strict CSP (`default-src 'self'`, `connect-src 'self' https://cognito-idp.us-east-1.amazonaws.com`), HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` and `Permissions-Policy`.

## Lambda Web Functions

- Node.js 24 on arm64; 2 vCPU and 2 GB fixed at launch.
- Code is bundled with esbuild into one file plus a production `node_modules` subset, zipped, uploaded as a CDK asset.
- Configuration comes from environment variables set by CDK (`TABLE_NAME`, `USER_POOL_ID`, `USER_POOL_CLIENT_ID`, `LOG_LEVEL`, `ENV`). No secrets are needed in the MVP; future ones go in SSM Parameter Store.
- Graceful shutdown: on SIGTERM, Fastify closes within 800 ms and flushes logs.
- Max environments are left unset at first: early reports show `429 Platform.EndpointMaxEnvThrottle` with low caps. Revisit once AWS publishes clearer behaviour.
- Constructs are in-house (`DaybookWebFunction`, `WebFunctionOrigin`) over the CloudFormation L1 resources until CDK ships L2 support.

### Infrastructure spike (first engineering task)

Before feature work, deploy a "hello" Fastify app through the full path to confirm:

1. CloudFront OAC to a Web Function endpoint works for GET and POST, including whether the client must send `x-amz-content-sha256` for bodies.
2. The `X-Daybook-Token` header reaches Fastify untouched.
3. Logs land in both log groups and retention applies to both.
4. Whether X-Ray / OTLP export works from inside a Web Function.
5. Observed environment lifetime and billing in Cost Explorer after a day of idle and a burst of use.

Record the findings as an update to ADR 0003.

## Environments

|                         | dev                               | prod                                                              |
| ----------------------- | --------------------------------- | ----------------------------------------------------------------- |
| URL                     | `https://{dev-id}.cloudfront.net` | `https://{prod-id}.cloudfront.net`                                |
| Branch                  | `develop`                         | `main`                                                            |
| Deploy trigger          | Merge to `develop`                | Merge to `main`, manual approval in the GitHub `prod` environment |
| Stateful removal policy | Destroy                           | Retain                                                            |
| Point-in-time recovery  | Off                               | On                                                                |
| Log retention           | 14 days                           | 30 days                                                           |
| Alarm notifications     | Developer email                   | Developer email                                                   |
| Test users              | Seeded e2e user                   | Real users only                                                   |

## CI/CD

GitHub Actions (repository remote still to be created). Branching is in [ADR 0014](../decisions/0014-branching-and-deployment-flow.md).

1. **Pull request** (into `develop` or `main`): install, Conventional Commit check on the title, `nx format:check`, `nx affected -t lint typecheck test build`, integration tests with DynamoDB Local (Testcontainers), web e2e against the prod-like Docker Compose stack, `cdk synth` and diff for affected infra.
2. **Merge to `develop`:** the same checks, build as `X.Y.Z-dev.{shortSha}`, `cdk deploy` dev, then the Playwright smoke suite against the dev URL.
3. **Merge to `main`:** compute the next version from Conventional Commits, build with it, manual approval in the `prod` environment, `cdk deploy` prod, smoke suite against prod with a read-only health check, then tag `vX.Y.Z` and publish the GitHub release ([ADR 0016](../decisions/0016-semantic-versioning.md)).

The workflow assumes a role through GitHub OIDC; no long-lived AWS keys exist.

## Cost estimate

Monthly, us-east-1, assuming beta-scale use. Web Function memory is billed for every minute an environment is warm, including idle time until it is reaped (about 5 minutes).

| Item                                        | dev         | prod        | Basis                                                                                                  |
| ------------------------------------------- | ----------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| Lambda Web Function memory                  | $0.26       | $1.06       | 2 GB × $0.0000036667 per GB-second; 10 warm hours dev, 40 warm hours prod                              |
| Lambda Web Function CPU and requests        | $0.01       | $0.03       | Active CPU only; $0.30 per million requests                                                            |
| DynamoDB                                    | $0.01       | $0.03       | On-demand requests; storage inside always-free 25 GB                                                   |
| CloudFront                                  | $0.00       | $0.00       | Always-free 1 TB and 10 million requests                                                               |
| S3 (build, CDK assets, note overflow)       | $0.01       | $0.01       | A few MB                                                                                               |
| Cognito                                     | $0.00       | $0.00       | Free to 10,000 MAU                                                                                     |
| CloudWatch logs, metrics, alarms, dashboard | $0.00       | $0.05       | Inside free tier (5 GB logs, 10 metrics, 10 alarms, 3 dashboards); logs stored twice for Web Functions |
| SNS, Budgets, SSM                           | $0.00       | $0.00       | Free tier                                                                                              |
| **Total**                                   | **≈ $0.29** | **≈ $1.18** | **≈ $1.47 per month**                                                                                  |

**Breakeven.** The cap allows about 68 warm environment-hours per month across both environments. Because one environment serves many concurrent requests, cost tracks hours with anyone using the app, not the number of users. Two or three people in different time zones keeping the app open all day would exceed it.

**Exit plan.** If the forecast passes $2 for two months running, switch to standard Lambda through the `main.lambda.ts` adapter (inside the always-free 1 million requests and 400,000 GB-seconds) and record a new ADR.
