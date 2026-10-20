# Banner

An inline message across the top of a view: a notice that asks for a decision, or an error.

- **Notice** (`db-banner--notice`, `role="status"`): `notice-bg` with `notice-ink`. Used for the carry-over prompt; offers one action and Dismiss. Shown once per day.
- **Error** (`db-banner--error`, `role="alert"`): `error-bg` with `error-ink`. Says what went wrong and links to the fix.
- Never more than one banner at a time, and never for success; successes use the Undo toast.
