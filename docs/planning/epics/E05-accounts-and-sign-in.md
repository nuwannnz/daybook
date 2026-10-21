# E05. Accounts and sign-in

- Status: Ready
- Milestone: M0 Foundations
- PRD: NFR privacy and security; NAV-4 (layouts at mobile width)
- Depends on: E02, E03 (S03), E06 (S01, S02)
- Design: `design/canvas/SignUp.dc.html`, `SignIn.dc.html`, `Reset.dc.html`, `MobileSignIn.dc.html`; `design/system/components/Button`, `TextField`, `Banner`

## Goal

A person can create a Daybook account with email and password, sign in on any device, and reset a forgotten password. Every API call is tied to that person, locally and on Cognito.

## Scope

In:

- Cognito user pool and app client per environment.
- `TokenVerifier` (Cognito and local adapters), auth plugin, `userId` in the request context.
- `AuthService` (Amplify and local adapters).
- Sign up with live password strength and a 6-digit code verification step.
- Sign in, sign out and route guard; mobile sign-in layout.
- Reset password by 6-digit code.

Out:

- Google and Apple buttons: hidden behind a flag (ADR 0008, Q8).
- "Email me a sign-in link instead": hidden; passwordless sign-in is Q21.
- Terms and Privacy pages: the checkbox links wait on Q19.
- Account deletion: Q7.
- Moving email to SES: M6 backlog.

## Architecture touchpoints

- **Domain:** `PasswordPolicy` (10 or more characters with a number) and `passwordStrength` score, shared by the sign-up and reset screens.
- **Application:** `TokenVerifier` port; local `AuthIssuer` for `AUTH_MODE=local`.
- **Data:** none in DynamoDB; users live in Cognito. The local adapter keeps local users in the table under `LOCALAUTH#{email}` (local only). Note this in data-model.md.
- **API:** auth plugin reading `X-Daybook-Token`; local-only routes `/api/local-auth/*` and `/.well-known/jwks.json`.
- **Web:** `AuthService` port, Amplify adapter and local adapter in `libs/web/data-access`; `libs/web/feature-auth` with facades; session state slice; route guard.
- **Infra and observability:** `Daybook-{env}-Auth` stack (free tier). Sign-in failures are counted in logs, never with the email.
- **ADRs:** 0008, 0015.

## Risks and open questions

- Q17 and Q18 are answered: code entry for both sign-up verification and reset. The canvas needs a new sign-up "Check your email" state and a code field on the reset "sent" step (backlog item added).
- Q20: the Reset "done" screen says other devices will sign out. Cognito may not revoke refresh tokens on reset by itself. S04 assumes a global sign-out after reset (assumes Q20).
- Cognito's built-in email allows 50 emails a day, which is enough for beta.
- Tokens live in browser storage through Amplify; the CSP from E03-S03 must stay strict.

## Stories

### E05-S01. Cognito pool and a signed-in API

- Status: Todo

So that every API route except health and telemetry knows which person is calling and refuses everyone else.

**Acceptance criteria**

- Given a request without `X-Daybook-Token` to a protected route, when it arrives, then the API returns `401` problem details with `code: unauthenticated`.
- Given a valid Cognito access token, when it arrives, then the handler sees `userId` equal to the token's `sub`, and no handler reads a user id from the body or path.
- Given an expired or wrongly signed token, when it arrives, then the API returns `401` and logs the reason without the token.
- Given `AUTH_MODE=local`, when a token signed by the local issuer arrives, then it is accepted; given `ENV=prod`, local mode refuses to start (E02-S05 guard).
- The Web Function bundle does not contain the local issuer code.

**Tests first**

- Unit: the local issuer signs and verifies; expired tokens fail.
- Integration: `CognitoTokenVerifier` against a JWKS fixture (no network).
- API: `inject` tests on a protected test route for missing, invalid, expired and valid tokens.
- CDK assertions: user pool password policy, email sign-in, app client with SRP and no secret.

**Tasks**

- [ ] Failing `apps/api-e2e/src/auth/protected-route.spec.ts`
- [ ] `TokenVerifier` port and fake in `libs/api/application`
- [ ] `CognitoTokenVerifier` (`aws-jwt-verify`) and `LocalTokenVerifier` in `libs/api/infrastructure`
- [ ] Local issuer, `/api/local-auth/*` routes and JWKS, registered only when `AUTH_MODE=local`
- [ ] Auth plugin and request context typing in `apps/api/src/http`
- [ ] esbuild define that removes the local auth code from the Web Function bundle
- [ ] `Daybook-{env}-Auth` stack and API env vars `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`
- [ ] Add `LOCALAUTH#` items (local only) to data-model.md
- [ ] e2e passes locally and against dev

### E05-S02. Create an account

- Status: Todo

As an independent professional trying Daybook, I want to create an account with my email in under a minute, so that I can start capturing straight away.

**Acceptance criteria**

- Given the Create account screen, when I type a password, then the strength meter updates live using the canvas scoring and the help line reads "At least 10 characters, with a number".
- Given a password that fails the policy, when I submit, then the field shows the error under it with `aria-invalid`, and Create account explains what is missing rather than being silently disabled.
- Given valid name, email and password, when I submit, then a "Check your email" step asks for the 6-digit code, with Resend and "Use a different email".
- Given the right code, when I submit it, then I am signed in and land on `/today`.
- Given a wrong or expired code, when I submit it, then the error says what happened and offers Resend.
- Given an email that already has an account, when I submit, then the message says so and offers Sign in or reset password.
- Google and Apple buttons are not shown; the Terms checkbox shows, and its links wait on Q19.
- All fields have visible labels and correct `autocomplete`; the flow works by keyboard alone; axe is clean.

**Tests first**

- Unit: `PasswordPolicy` and `passwordStrength` match the canvas scoring (length 10, number, upper or symbol, length 14).
- Component: the sign-up form states (typing, policy error, submitting, server error) by role and label.
- e2e (local auth): sign up, read the code from the local auth mailbox endpoint, verify, land on Today.

**Tasks**

- [ ] Failing `apps/web-e2e/src/auth/sign-up.spec.ts`
- [ ] `PasswordPolicy` and `passwordStrength` in `libs/shared/domain`
- [ ] `AuthService` port (`signUp`, `confirmSignUp`, `resendCode`) with Amplify and local adapters in `libs/web/data-access`
- [ ] Local auth: sign-up, code generation logged to the console and readable from a test-only mailbox route
- [ ] `PasswordStrength` and `AuthCard` layout components in `libs/ui`
- [ ] `useSignUpFacade` and screens in `libs/web/feature-auth`, matching `SignUp.dc.html`, plus the new code step
- [ ] e2e passes; axe clean

### E05-S03. Sign in and sign out

- Status: Todo

As a busy individual contributor, I want to sign in on my laptop and phone and stay signed in, so that Daybook is always one tap away.

**Acceptance criteria**

- Given correct credentials, when I sign in, then I land on `/today`, and a reload keeps me signed in.
- Given a wrong password, when I sign in, then the error banner reads "That email and password don’t match. Try again, or reset your password." with a link to reset.
- Given sign-in is in progress, when I look at the button, then it reads "Signing in…" and repeat submits are ignored.
- Given I am signed out, when I open `/today`, then I am sent to sign in and returned to `/today` afterwards.
- Given I choose Sign out, when it completes, then tokens are cleared and protected pages redirect to sign in.
- Given a 360 px wide screen, when I open sign in, then the mobile layout from `MobileSignIn.dc.html` shows with 44 px targets.
- The password field has a Show/Hide toggle with an accessible name.
- "Email me a sign-in link instead" and social buttons are not shown (Q21, Q8).

**Tests first**

- Component: default, error and loading states from the canvas tweaks.
- Unit: the route guard facade decides redirect targets.
- e2e (local auth): sign in, reload, sign out, protected redirect; mobile viewport run.

**Tasks**

- [ ] Failing `apps/web-e2e/src/auth/sign-in.spec.ts`
- [ ] `AuthService.signIn`, `signOut`, `currentSession` in both adapters; token attached to `X-Daybook-Token` by the HTTP client
- [ ] Session slice and route guard in `libs/web/data-access`
- [ ] `PasswordField` (Show/Hide) in `libs/ui`
- [ ] `useSignInFacade` and screens (desktop and mobile) in `libs/web/feature-auth`
- [ ] Sign out entry in the app shell (E06-S03)
- [ ] e2e passes; axe clean

### E05-S04. Reset a forgotten password

- Status: Todo

As a graduate student who hasn't signed in for weeks, I want to reset my password from the sign-in screen, so that I can get back to my notes.

**Acceptance criteria**

- Given the reset screen, when I enter my email and choose "Send reset code", then the "Check your email" step shows that address, a 6-digit code field, a new password field with the policy help, and Resend.
- Given the right code and a valid new password, when I submit, then "Password updated" shows with "Go to Today", and I am signed in on this device.
- Given the reset completes, when another device next calls the API, then it is asked to sign in again (assumes Q20).
- Given a wrong or expired code, when I submit, then the error says so and offers Resend.
- Given an email with no account, when I request a code, then the screen behaves the same as for a real account.
- The flow works by keyboard alone; axe is clean.

**Tests first**

- Component: request, sent, done and error states.
- e2e (local auth): request a code, read it from the mailbox route, set a new password, sign in with it; the old password fails.

**Tasks**

- [ ] Failing `apps/web-e2e/src/auth/reset-password.spec.ts`
- [ ] `AuthService.requestPasswordReset` and `confirmPasswordReset` in both adapters, with global sign-out after reset
- [ ] Local auth reset codes and token revocation
- [ ] `useResetPasswordFacade` and screens in `libs/web/feature-auth`, matching `Reset.dc.html` with the code field
- [ ] Verify Cognito's behaviour for Q20 against dev and record the answer
- [ ] e2e passes; axe clean
