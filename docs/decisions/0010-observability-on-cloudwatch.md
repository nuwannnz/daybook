# 0010. Observability on CloudWatch, no third-party SDKs

- Status: accepted
- Date: 2026-10-20

## Context

The PRD forbids third-party tracking SDKs and content in analytics. The cost cap rules out paid APM, CloudWatch RUM ($1 per 100,000 events) and Synthetics canaries. Lambda Web Functions have no extensions API, so telemetry must leave from inside the process.

## Decision

- **Logs.** Structured JSON from Fastify's pino logger to stdout, with a request id, CloudFront id, route, status, latency and hashed user id. Never titles, note text or emails. Retention 14 days in dev and 30 days in prod, set on both the regional and central Web Function log groups.
- **Metrics.** CloudWatch Embedded Metric Format written to stdout, in prod only, kept to 10 custom metrics in total (the account free tier). Dev relies on AWS-provided metrics and Logs Insights.
- **Traces.** OpenTelemetry in-process with a sampled exporter to AWS X-Ray, if the infrastructure spike confirms Web Functions can reach it. Until then, request ids propagate from browser to API to logs.
- **Frontend.** An error boundary, `window.onerror`, unhandled rejections and Web Vitals are batched and sent with `navigator.sendBeacon` to `POST /api/telemetry`, which logs them as structured events. Product analytics events from the PRD go through the same endpoint with ids and counts only.
- **Alarms and dashboard.** One CloudWatch dashboard per environment; 10 alarms in total (seven prod, three dev), notifying an SNS email topic.

Details are in [architecture/observability.md](../architecture/observability.md).

## Consequences

- Everything stays inside AWS, inside the free tier, with no content leaving the account.
- No session replay or hosted error grouping; Logs Insights queries replace them. Sentry's free tier is the fallback if this proves too thin, through a new ADR and a privacy review.
