# E03. AWS environments and delivery

- Status: Ready
- Milestone: M0 Foundations
- PRD: none (platform)
- Depends on: E01, E02 (S01 for the spike; S05 for CI e2e)
- Design: none

## Goal

Merging to `develop` deploys dev and merging to `main` deploys prod after approval, inside the $2 monthly budget, with the Web Function risks from ADR 0003 tested before feature work starts.

## Scope

In:

- Web Function spike and findings.
- Account stack: budget, cost allocation tag, GitHub OIDC, deploy roles.
- Data, Api and Web stacks for dev, then prod.
- Pull request checks and deploy workflows with post-deploy smoke tests, version tags and GitHub releases.

Out:

- Auth stack: E05-S01.
- Observability stack (alarms, dashboard): E04.
- Custom domain: not planned (ADR 0012).

## Architecture touchpoints

- **Data:** `Daybook-{env}-Data` creates the table from the shared definition (E02-S02).
- **API:** the E02 bundle deployed as a Web Function revision with an `IamAuth` endpoint.
- **Web:** static export in S3 behind CloudFront with the CloudFront Function rewrite and response headers policy.
- **Infra and observability:** every stack in [infrastructure.md](../../architecture/infrastructure.md); log retention set on both Web Function log groups here so nothing is stored forever before E04.
- **ADRs:** 0003, 0004, 0012, 0014, 0016.

## Risks and open questions

- Q10: Web Function cost in real use. The budget alert from S02 is the guard; S01 records observed environment lifetime.
- Q11: whether POST bodies through OAC need `x-amz-content-sha256`. S01 answers it; the web HTTP client may need a hashing task.
- Q12: X-Ray from a Web Function. S01 answers it for E04.
- CDK has no L2 for Web Functions; the in-house construct may need changes as AWS ships support.
- The GitHub repository must exist (E01-S01) before OIDC can be set up.

## Stories

### E03-S01. Web Function spike behind CloudFront in dev

- Status: Todo

So that the riskiest platform choice is tested before anything depends on it.

**Acceptance criteria**

- Given the E02 API bundle deployed as a Web Function with an `IamAuth` endpoint, when I call `https://{dev}.cloudfront.net/api/health`, then it returns `200` with the version.
- Given the endpoint URL called directly without SigV4, when I request it, then it is refused.
- Given a `POST` with a JSON body through CloudFront, when the API echoes its size (temporary spike route), then the body arrives intact; the headers the client needed are recorded.
- Given a request with `X-Daybook-Token`, when it reaches Fastify, then the header is present and unchanged.
- ADR 0003 has a "Spike findings" section covering: OAC and POST bodies (Q11), header forwarding, both log groups and retention, X-Ray or OTLP export (Q12), observed environment lifetime and the first day's cost.

**Tests first**

- `apps/api-e2e` health spec run with `BASE_URL` set to the dev CloudFront URL.
- CDK assertions: the endpoint auth type is `IamAuth`, the resource policy allows only `cloudfront.amazonaws.com` scoped to the distribution ARN, and both log groups have retention.

**Tasks**

- [ ] CDK assertions for the constructs below (failing)
- [ ] `DaybookWebFunction` construct over `AWS::Lambda::WebFunction`, `WebFunctionRevision`, `WebFunctionEndpoint`
- [ ] `WebFunctionOrigin` construct: CloudFront custom origin, OAC type `lambda`, resource policy with `aws:SourceArn`
- [ ] Minimal `Daybook-dev-Api` and a throwaway distribution; deploy by hand from a laptop
- [ ] Temporary echo route behind a spike flag, removed at the end of the story
- [ ] Run the api-e2e health spec against dev
- [ ] Write "Spike findings" in ADR 0003; close or update Q11 and Q12; add follow-up backlog items (for example payload hashing in the HTTP client)

### E03-S02. Account guardrails and deploy access

- Status: Todo

So that overspend is caught early and CI can deploy without long-lived keys.

**Acceptance criteria**

- Given the account stack is deployed, when month-to-date cost reaches $1 or $1.60, or the forecast reaches $2, then an email goes to the owner.
- Given Cost Explorer, when I group by tag `env`, then dev and prod costs show separately.
- Given a GitHub Actions run on `develop`, when it assumes the dev deploy role through OIDC, then it can deploy `Daybook-dev-*` stacks and cannot touch `Daybook-prod-*` resources.
- Given a run on `main` in the `prod` environment, when it assumes the prod role, then it can deploy prod stacks.
- No IAM user or access key exists for CI.

**Tests first**

- CDK assertions: one budget with three notifications; OIDC provider with `sub` conditions per branch and environment; deploy role policies scoped by resource prefix.

**Tasks**

- [ ] CDK assertions (failing)
- [ ] `Daybook-Account` stack: AWS Budget at $2 with the three notifications, SNS budget topic with owner email
- [ ] Activate the `env` cost allocation tag (one-time manual step, documented)
- [ ] GitHub OIDC provider and two deploy roles with branch and environment conditions
- [ ] CDK bootstrap for us-east-1 with the deploy roles trusted
- [ ] Record the one-time manual steps in `docs/architecture/infrastructure.md`

### E03-S03. Dev environment reachable on its CloudFront URL

- Status: Todo

So that the walking skeleton from E02 runs in AWS exactly as it does locally.

**Acceptance criteria**

- Given `nx run infra:deploy --configuration=dev`, when it completes, then `https://{dev}.cloudfront.net/today` shows the shell page with the API version and `checks.table: ok`.
- Given `/today` is requested, when CloudFront serves it, then the CloudFront Function rewrites it to `today.html`.
- Given any response, when I inspect headers, then CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy` match infrastructure.md.
- Given the S3 bucket URL, when I request an object directly, then access is denied.
- Dev stateful resources use `RemovalPolicy.DESTROY`; the table uses on-demand capacity with a maximum throughput set.

**Tests first**

- CDK assertions for Data (keys, GSIs, TTL, max throughput, no PITR in dev), Web (OAC, two behaviours, headers policy, function association) and Api (env vars, IAM scoped to the table).
- The E02 shell e2e spec run against the dev URL.

**Tasks**

- [ ] CDK assertions (failing)
- [ ] `Daybook-dev-Data` from `daybookTableDefinition`
- [ ] `Daybook-dev-Api` from the S01 constructs with `TABLE_NAME`, `ENV`, `LOG_LEVEL`, `DAYBOOK_VERSION`
- [ ] `Daybook-dev-Web`: private bucket, distribution with `/api/*` and default behaviours, CloudFront Function rewrite, response headers policy, bucket deployment of the static export
- [ ] Environment config type shared by stacks (`dev`, `prod` differences from infrastructure.md)
- [ ] Remove the spike's throwaway distribution
- [ ] Run the shell e2e against dev; update the cost estimate if anything differs

### E03-S04. Pull request checks

- Status: Todo

So that nothing merges into `develop` or `main` without passing the same gates every time.

**Acceptance criteria**

- Given a pull request, when CI runs, then it checks the title against Conventional Commits, `nx format:check`, `nx affected -t lint typecheck test`, integration tests, e2e on the prod-like Compose stack, and `cdk synth` with a diff comment for affected infra.
- Given any check fails, when I look at the pull request, then merging is blocked by branch protection.
- Given an unchanged project, when CI runs, then its targets are skipped or restored from cache.
- Given a pull request from a fork, when CI runs, then no AWS credentials are available to it.

**Tests first**

- Open a pull request that breaks each gate in turn (format, lint, unit test, title) and confirm each one blocks; record the run links in the story.

**Tasks**

- [ ] `.github/workflows/pr.yml` with Node 24, dependency cache and Nx affected base from the target branch
- [ ] Title check job (Conventional Commits)
- [ ] Integration job with Docker for Testcontainers
- [ ] e2e job using the `e2e-prodlike` target from E02-S05, uploading Playwright traces on failure
- [ ] `cdk synth` and diff job using a read-only role, posting the diff as a comment
- [ ] Mark the jobs as required checks on `develop` and `main`

### E03-S05. Deploy dev and prod from branches, with versions

- Status: Todo

So that `develop` is always running on dev and every prod release is versioned, approved and smoke-tested.

**Acceptance criteria**

- Given a merge to `develop`, when the workflow runs, then it builds with version `X.Y.Z-dev.{shortSha}`, deploys dev, and runs the smoke suite against the dev URL.
- Given a merge to `main`, when the workflow runs, then it computes the next version, builds with it, waits for approval in the GitHub `prod` environment, deploys prod, runs the smoke suite, and only then tags `vX.Y.Z` and publishes a GitHub release with the changelog.
- Given the prod deploy or smoke test fails, when the workflow ends, then no tag or release exists.
- Given prod is deployed, when I call `/api/health`, then `version` equals the new tag.
- Prod uses `RemovalPolicy.RETAIN` and point-in-time recovery, per infrastructure.md.

**Tests first**

- CDK assertions for prod differences (retain, PITR, 30-day retention).
- The smoke suite (health plus shell page) tagged `@smoke` in `apps/web-e2e` and `apps/api-e2e`.

**Tasks**

- [ ] CDK assertions for prod config (failing)
- [ ] `@smoke` tags and an Nx target to run only them against a `BASE_URL`
- [ ] `.github/workflows/deploy-dev.yml` using `tools/version.ts --prerelease`
- [ ] `.github/workflows/deploy-prod.yml` with the `prod` environment approval, version from E01-S04, tag and release on success
- [ ] Release-PR check that `main` is an ancestor of `develop` (ADR 0014)
- [ ] First prod deploy as `v0.1.0`; update the cost estimate after a week of both environments
