# 0008. Amazon Cognito with email and password

- Status: accepted
- Date: 2026-10-20

## Context

The design canvas has Sign in, Create account, Reset password and Mobile sign in screens, with email/password plus Google and Apple buttons. Sign in with Apple needs a paid Apple Developer account. Auth must be free at beta scale.

## Decision

- One Cognito user pool per environment (Lite or Essentials tier, free up to 10,000 monthly active users).
- MVP supports email and password only: sign up with email verification, sign in, sign out, reset password. The Google and Apple buttons are hidden behind a feature flag.
- The web app uses its own screens from the design canvas, not the Cognito hosted UI. Calls go through an `AuthService` port; the adapter uses the Amplify Auth library (SRP sign-in) and is the only code that imports it.
- The API verifies the Cognito ID or access token from the `X-Daybook-Token` header with `aws-jwt-verify` in a Fastify plugin, and derives `userId` from the `sub` claim. No endpoint trusts a user id from the body or path.
- Cognito's built-in email sender is used for beta (50 emails per day). Moving to SES is a backlog item before public launch.
- Password policy: at least 10 characters, matching the sign-up screen's strength meter.

## Consequences

- Auth costs nothing at beta scale and needs no servers.
- Adding Google later is a user-pool identity provider plus a button; Apple waits for a developer account.
- Tokens are stored by the Amplify library in browser storage; the threat model and CSP must account for that.
- The local Docker stack swaps in local `AuthService` and `TokenVerifier` adapters ([0015](0015-local-stack-with-docker-compose.md)), so the Cognito adapter is only exercised against dev.
