# Observability and monitoring

How Daybook is watched in dev and prod for close to zero cost ([ADR 0010](../decisions/0010-observability-on-cloudwatch.md)). Nothing sent to CloudWatch contains note text, task titles, project names or emails.

## Service level objectives

Taken from the PRD's non-functional requirements and measured on prod.

| SLO                             | Target                                      | Source                                     |
| ------------------------------- | ------------------------------------------- | ------------------------------------------ |
| API availability                | 99.5% of requests are not 5xx, over 28 days | API request logs                           |
| API latency                     | p95 < 300 ms for reads, < 500 ms for writes | `ApiLatency` metric                        |
| Cold start to interactive Today | p75 ≤ 1.5 s on desktop                      | Web Vitals via telemetry                   |
| View switch                     | p75 ≤ 100 ms                                | Custom `view_switch_ms` web metric         |
| Capture to saved                | median ≤ 2 s                                | `item_captured.ms_to_save` analytics event |
| Cross-device freshness          | ≤ 5 s                                       | Poll interval; checked in e2e              |

## Signals

### Logs

- The API logs one structured JSON line per request through the `Logger` port (pino adapter): `requestId`, `cfId`, `route`, `method`, `status`, `latencyMs`, `userHash` (salted SHA-256 of the user id), `env`, `version` (semantic version, [ADR 0016](../decisions/0016-semantic-versioning.md)).
- Application events (`task.completed`, `note.merged`, `conflict.retried`) are logged at `info` with ids only.
- Errors log the problem `code`, stack and request id at `error`. Validation failures log the schema path, never the value.
- The request id comes from the client's `X-Request-Id` header or is generated, and is returned in the response so a user-reported error can be found.

### Metrics

EMF lines written by the `Metrics` port, namespace `Daybook/prod`. The free tier allows 10 custom metrics per account, and each metric and dimension value pair counts as one, so custom metrics are emitted in prod only (dev's `Metrics` adapter logs them without EMF). The set below is exactly 10:

| Metric            | Dimension values           | Count | Used for                |
| ----------------- | -------------------------- | ----- | ----------------------- |
| `ApiRequests`     | `RouteClass` = read, write | 2     | Traffic                 |
| `ApiErrors`       | `Kind` = 4xx, 5xx          | 2     | Error rate alarm        |
| `ApiLatency`      | `RouteClass` = read, write | 2     | p95 alarm               |
| `DynamoConflicts` | none                       | 1     | Optimistic-lock retries |
| `WebErrors`       | none                       | 1     | Frontend error alarm    |
| `WebVitalLCP`     | none                       | 1     | Cold start SLO          |
| `CaptureMs`       | none                       | 1     | Capture SLO             |

Anything else (Yjs state growth, per-route detail) is a Logs Insights query over the structured logs. Adding a metric means removing one or accepting $0.30 per metric per month.

AWS-provided metrics (free): Web Function invocations, throttles and duration; DynamoDB consumed capacity, throttles, system errors; CloudFront 4xx and 5xx rates; Cognito sign-in successes and throttles.

### Traces

- Each request gets an OpenTelemetry span with child spans for DynamoDB calls, exported to X-Ray at 5% sampling, if the [infrastructure spike](infrastructure.md#infrastructure-spike-first-engineering-task) confirms export works from a Web Function. X-Ray's always-free tier covers 100,000 traces per month.
- Until then, the request id ties browser, API and logs together, and Logs Insights replaces trace search.

### Frontend telemetry

- `libs/web/data-access` has a `TelemetryClient` port; the adapter batches events and sends them with `navigator.sendBeacon` to `POST /api/telemetry` every 10 s or on page hide.
- Captured: React error boundary errors, `window.onerror`, unhandled rejections (message, stack and route, no state), Web Vitals (LCP, INP, CLS) and the PRD analytics events (ids and counts only, schema in `libs/shared/contracts`).
- The API validates each event against its schema, drops anything unknown, and logs it as `telemetry.*` so metric filters and Logs Insights can use it.

### Product analytics

The PRD's analytics events (`capture_opened`, `item_captured`, `task_completed`, …) land in the logs as `analytics.*` events. Weekly metrics such as weekly planned days and week-4 retention are answered with saved Logs Insights queries in the MVP. If those queries get slow or costly, export logs to S3 and query with Athena through a new ADR.

## Dashboard

One CloudWatch dashboard per environment, `Daybook-{env}`:

1. Requests, 4xx, 5xx and p50/p95 latency by route class.
2. Web Function environments, throttles (`429`) and cold starts.
3. DynamoDB consumed capacity, throttles and conflicts.
4. Frontend errors and Web Vitals p75.
5. Capture time median and the day's analytics event counts.
6. Month-to-date estimated charges (billing metric, account-wide).

## Alarms

The free tier covers 10 alarms per account, so prod gets seven and dev three, all sent to the `daybook-{env}-alerts` SNS topic (email).

| Alarm                               | Env       | Condition                                                        |
| ----------------------------------- | --------- | ---------------------------------------------------------------- |
| API 5xx rate                        | prod      | `ApiErrors{5xx}` > 2% of requests over 5 minutes, 2 of 3 periods |
| API p95 latency                     | prod      | `ApiLatency` p95 > 800 ms over 10 minutes                        |
| Web Function throttles              | prod, dev | Any `429` platform throttle in 5 minutes (AWS metric)            |
| DynamoDB throttles or system errors | prod, dev | > 0 over 5 minutes (AWS metric)                                  |
| Optimistic-lock conflicts           | prod      | `DynamoConflicts` > 20 in 5 minutes (possible client loop)       |
| Frontend errors                     | prod      | `WebErrors` > 10 in 10 minutes                                   |
| Capture SLO                         | prod      | `CaptureMs` median > 2,000 ms over 1 hour                        |
| CloudFront 5xx rate                 | dev       | `5xxErrorRate` > 5% over 5 minutes (AWS metric)                  |

Deploy smoke-test failures are reported by the GitHub Actions run, not by an alarm.

The AWS Budget (account-wide, $2) alerts by email at 50% and 80% actual and 100% forecast; see [infrastructure.md](infrastructure.md#cost-estimate).

## Health and runbooks

- `GET /api/health` returns the version and checks a DynamoDB `DescribeTable` (cached 60 s). It is unauthenticated and rate-limited.
- Each alarm's description links to a runbook section in `docs/guides/runbooks.md` (to be written with the first alarm).
- Deploys set the version and git SHA as the Web Function revision description; the dashboard shows version changes as annotations.
