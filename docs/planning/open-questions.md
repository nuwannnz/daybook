# Open questions

Tracked from the PRD's [risks and open questions](../product/PRD.md#risks-dependencies-and-open-questions) plus technical questions raised while writing the architecture. Close a question by recording the answer and, for technical ones, the ADR.

## Product

| #   | Question                                                                                             | Owner | Status                                                                                     |
| --- | ---------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------ |
| 1   | Should Top 3 be capped at three, or allow a user setting of one to five?                             | Nuwan | Open                                                                                       |
| 2   | Do dismissed carry-over tasks return to the unscheduled tray or to Inbox?                            | Nuwan | Open                                                                                       |
| 3   | Is the week board's default start Monday everywhere, or locale-based?                                | Nuwan | Open                                                                                       |
| 4   | Should notes support images and file attachments in v1, or wait for v1.1?                            | Nuwan | Open                                                                                       |
| 5   | Pricing: free with limits, or a paid plan from day one?                                              | Nuwan | Open                                                                                       |
| 6   | Do we name the product Daybook, pending a trademark check?                                           | Nuwan | Open                                                                                       |
| 7   | Account deletion: required for beta? The PRD covers export but not deletion.                         | Nuwan | Open                                                                                       |
| 8   | When does Google sign-in return, and is Apple sign-in worth a paid developer account?                | Nuwan | Open                                                                                       |
| 17  | Sign-up email verification: code or link? The canvas has no verification screen.                     | Nuwan | Closed: 6-digit code step ([E05-S02](epics/E05-accounts-and-sign-in.md)); canvas to update |
| 18  | Reset password: link (as in the canvas) or code (Cognito default)?                                   | Nuwan | Closed: code entry ([E05-S04](epics/E05-accounts-and-sign-in.md)); canvas to update        |
| 19  | Terms and Privacy: who writes them, and are they needed for the private beta sign-up checkbox?       | Nuwan | Open                                                                                       |
| 21  | "Email me a sign-in link instead" on the sign-in canvas: in scope for v1, or remove from the design? | Nuwan | Open                                                                                       |

## Technical

| #   | Question                                                                                                                   | Owner       | Status                                                                                                                                                                 |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 9   | Which tech stack and sync approach?                                                                                        | Nuwan       | Closed: ADRs [0001](../decisions/0001-nx-monorepo-strict-typescript.md)–[0012](../decisions/0012-environments-and-cost-guardrails.md); online-first MVP, offline in v1 |
| 10  | Will Lambda Web Functions stay within the $2 cap with real beta use?                                                       | Nuwan       | Open: measure after one month; exit plan in [ADR 0012](../decisions/0012-environments-and-cost-guardrails.md)                                                          |
| 11  | Does CloudFront OAC to a Web Function need `x-amz-content-sha256` on POST/PUT?                                             | Engineering | Open: infrastructure spike                                                                                                                                             |
| 12  | Can a Web Function export traces to X-Ray?                                                                                 | Engineering | Open: infrastructure spike                                                                                                                                             |
| 13  | Is the 300 KB threshold for moving Yjs state to S3 right?                                                                  | Engineering | Open: track Yjs state size in logs during beta                                                                                                                         |
| 14  | Is a filtered partition query fast enough for search, or is a client-side index needed?                                    | Engineering | Open: test with 500 notes and 2,000 tasks                                                                                                                              |
| 15  | npm or pnpm workspaces?                                                                                                    | Engineering | Open: decide at scaffold, record in ADR 0001                                                                                                                           |
| 16  | Analytics retention: are 30 days of logs enough for week-4 retention metrics?                                              | Nuwan       | Open: may need S3 export before launch                                                                                                                                 |
| 20  | Does Cognito sign out other devices after a password reset, or do we call a global sign-out? The Reset canvas promises it. | Engineering | Open: E05-S04 assumes global sign-out and verifies on dev                                                                                                              |
