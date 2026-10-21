# E04. Observability baseline

- Status: Ready
- Milestone: M0 Foundations
- PRD: NFR privacy (no content in analytics); success-metric analytics events (transport only)
- Depends on: E02, E03 (S03 for dev; S05 for prod alarms)
- Design: none

## Goal

When something breaks in dev or prod, the owner hears about it and can trace it from browser to API to database, without any note, task or email content leaving the app.

## Scope

In:

- `Logger` and `Metrics` ports with pino and EMF adapters; request ids end to end.
- The ten prod custom metrics and the per-environment dashboard.
- `/api/telemetry` and the web `TelemetryClient` for errors and Web Vitals, plus the analytics event transport.
- The ten alarms, SNS alert topics and log retention.

Out:

- Individual analytics events (`item_captured`, `top3_set`, …): added by the feature stories that own them.
- Tracing with X-Ray: depends on Q12, answered by E03-S01; added as a backlog item if supported.
- Runbooks: M6 backlog.

## Architecture touchpoints

- **Application:** `Logger`, `Metrics` and `TelemetryIngest` ports.
- **API:** request-id and logging plugins; `POST /api/telemetry`.
- **Web:** `TelemetryClient` port and beacon adapter; React error boundary.
- **Infra and observability:** `Daybook-{env}-Observability` stack. Exactly 10 custom metrics (prod only) and 10 alarms in total (7 prod, 3 dev), per [observability.md](../../architecture/observability.md). Any change needs the free-tier check.
- **ADRs:** 0010, 0016.

## Risks and open questions

- Q12 (X-Ray from Web Functions) decides whether tracing is added later.
- Q16 (are 30 days of logs enough for retention metrics?) is not blocking for M0.
- Metric dimensions must stay exactly as listed; one extra dimension value costs $0.30 a month.

## Stories

### E04-S01. Structured request logs with request ids

- Status: Todo

So that any request can be found from a user report or a browser error using one id, without logs carrying user content.

**Acceptance criteria**

- Given any API request, when it completes, then exactly one JSON log line has `requestId`, `cfId`, `route`, `method`, `status`, `latencyMs`, `userHash`, `env` and `version`.
- Given the browser sends `X-Request-Id`, when the API responds, then the response carries the same id; without one, the API generates it.
- Given a request body containing a task title, when validation fails, then the log has the schema path and no value.
- Given `ENV=local`, when the API logs, then output is pretty-printed; in AWS it is JSON.
- `userHash` is a salted SHA-256 of the user id; the salt comes from config.

**Tests first**

- Unit: the redaction helper drops values and keeps paths; `userHash` is stable and not the raw id.
- API: `inject` with a captured logger asserts the fields and the echoed request id.

**Tasks**

- [ ] `Logger` port in `libs/shared/observability`, with a pino adapter and an in-memory test logger
- [ ] Request-id plugin and per-request log line in `apps/api/src/http`
- [ ] Redaction for validation errors; `userHash` helper
- [ ] `X-Request-Id` sent by the web `HttpClient` adapter
- [ ] Logs Insights saved queries (errors by code, slowest routes) defined in CDK

### E04-S02. Prod metrics and the dashboard

- Status: Todo

So that traffic, errors and latency are visible at a glance without paying for custom metrics in dev.

**Acceptance criteria**

- Given prod, when requests are served, then EMF lines produce exactly the ten metrics in observability.md under `Daybook/prod`.
- Given dev or local, when requests are served, then no EMF metrics are emitted; the same values appear in logs.
- Given the dashboard `Daybook-{env}`, when I open it, then it shows the panels listed in observability.md (prod uses custom metrics; dev uses AWS metrics only).

**Tests first**

- Unit: the `Metrics` port's EMF adapter writes the expected EMF structure; the log adapter writes plain fields.
- CDK assertions: dashboard widgets reference only the allowed metric names and dimensions.

**Tasks**

- [ ] `Metrics` port with EMF and log adapters in `libs/shared/observability`; adapter chosen by `ENV`
- [ ] Emit `ApiRequests`, `ApiErrors`, `ApiLatency` from the request plugin with `RouteClass` and `Kind`
- [ ] `Daybook-{env}-Observability` stack with the dashboard
- [ ] Free-tier check against the cost estimate

### E04-S03. Frontend errors and Web Vitals reach CloudWatch

- Status: Todo

So that crashes and slow loads in the browser are seen without a third-party SDK.

**Acceptance criteria**

- Given a React render error, when the error boundary catches it, then a quiet error view shows and a `telemetry.error` event with message, stack and route (no state) reaches the API logs within 15 s.
- Given LCP, INP and CLS are measured, when the page is hidden, then they are sent with `navigator.sendBeacon` in one batch.
- Given an event that fails its schema, when the API receives it, then it is dropped, counted, and the response is still `204`.
- Given the telemetry endpoint, when it receives more than 100 events in a request, then it rejects the request with `413`.
- Events carry `version`, and never titles, note text or emails.

**Tests first**

- Unit: the batching `TelemetryClient` flushes every 10 s and on page hide; schema tests for each event type.
- Component: the error boundary renders the fallback and calls the client.
- API: `inject` tests for valid, invalid and oversized batches.
- e2e: a test-only route throws, and the API log captures the event (via the local log stream).

**Tasks**

- [ ] Failing e2e for the error path
- [ ] Telemetry and analytics event schemas in `libs/shared/contracts` (union by `type`)
- [ ] `TelemetryIngest` handler and `POST /api/telemetry` (unauthenticated, rate-limited, size-limited)
- [ ] `TelemetryClient` port and beacon adapter in `libs/web/data-access`; Web Vitals collection
- [ ] Error boundary and fallback view in `libs/web/feature-shell` using `libs/ui` Banner (error)
- [ ] Emit `WebErrors` and `WebVitalLCP` (prod EMF) from the ingest handler; map `item_captured.ms_to_save` to `CaptureMs` so the metric starts once M1 sends the event
- [ ] e2e passes

### E04-S04. Alarms and alert topics within the free tier

- Status: Todo

So that the owner is emailed when prod or dev misbehaves, while staying within the 10 free alarms.

**Acceptance criteria**

- Given the observability stacks in both environments, when deployed, then there are exactly 7 prod and 3 dev alarms matching observability.md, each sending to `daybook-{env}-alerts`.
- Given a forced 5xx burst in dev (test-only route), when it exceeds the threshold, then the dev CloudFront 5xx alarm emails the owner.
- Given each alarm, when I read its description, then it states what it means and what to check first.
- Given every log group in both environments, when I check retention, then dev is 14 days and prod is 30 days.

**Tests first**

- CDK assertions: alarm count per environment, thresholds, actions and retention.

**Tasks**

- [ ] CDK assertions (failing)
- [ ] SNS topics with email subscriptions
- [ ] Prod and dev alarms per observability.md
- [ ] Test-only failure route enabled only when `ENV=dev`, removed after the check or kept behind the flag
- [ ] Trigger and confirm the dev alarm; note the result in the story
