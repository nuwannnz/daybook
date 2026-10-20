# 0002. Next.js static export for the web app

- Status: accepted
- Date: 2026-10-20

## Context

Daybook is a signed-in single-user app. Every screen renders from the person's own data after sign-in, so server rendering adds little and costs Lambda time. The cost cap is $2 per month for dev and prod together ([0012](0012-environments-and-cost-guardrails.md)).

## Decision

- The web app is Next.js (App Router) built with `output: 'export'` and served as static files from S3 through CloudFront.
- All data loads client-side through the API ([0003](0003-fastify-api-on-lambda-web-functions.md)).
- Routes avoid dynamic segments that need a server: entity pages use query parameters (`/projects?id=…`, `/notes?id=…`) and one static shell per view.
- `next/image` runs with `unoptimized: true`; fonts (Plus Jakarta Sans) are self-hosted from the build.
- Auth guarding is client-side; the API is the real security boundary.
- The app is installable as a PWA (manifest plus a service worker that caches the app shell only, not data, until offline mode lands in v1).

## Consequences

- No middleware, server actions, ISR or route handlers in the web app; anything server-side lives in the API.
- Hosting is effectively free (CloudFront always-free tier) and has no cold start.
- Moving to SSR later means swapping the hosting construct, not the components, because pages already render from client state.
