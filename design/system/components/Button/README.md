# Button

Buttons run one action; use `db-btn--primary` for the single main action in a view and quieter variants for the rest.

- **Primary** (`db-btn--primary`): `primary` fill, `on-primary` text. One per view: Add, Sign in, Save new password.
- **Secondary** (`db-btn--secondary`): `surface` with a `border` hairline. Navigation and neutral actions (Today, New note).
- **Text** (`db-btn--text`): `accent` text, no fill. Low-emphasis alternatives (Email me a sign-in link, Dismiss).
- **Icon** (`db-btn--icon`): 44 × 44, always with `aria-label`.
- **Large** (`db-btn--lg`): 52px tall, for the call to action at the end of a form or sheet.
- **Disabled**: only when the form says what is missing right under the button (see Create account). Never disable without a reason on screen.

Labels are verbs in sentence case and describe what happens: “Bring to today”, not “OK”. For navigation in prototypes the same classes go on an `<a href>`.
