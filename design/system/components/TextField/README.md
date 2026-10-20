# TextField

A labelled single-line input, 48px tall, with an optional help or error line under it.

- Always a visible `<label>` above the field; placeholders show an example, never the label.
- The border is `border-strong` so the field's edge passes 3:1. In error, set `aria-invalid="true"` (1.5px `error-border`) and put the message in `db-help--error`, linked with `aria-describedby`.
- Error text says what happened and what to do next, in `error-ink`.
- Use the right `type` and `autocomplete` (`email`, `current-password`, `new-password`, `name`).
- Password fields get a Show / Hide toggle inside the field (see Sign in on the canvas).
