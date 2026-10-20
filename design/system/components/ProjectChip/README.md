# ProjectChip

A small pill naming the project an item belongs to, in that project's pastel tone.

- `db-chip` plus one tone class: `db-tone--lavender`, `--mint`, `--peach`, `--rose`, `--sky`, `--butter` or `--inbox`. The tone sets `*-bg` with its matching `*-ink`.
- Always the project's name as text; colour is never the only cue.
- Use the same tone everywhere the project appears (dot, Top 3 number, schedule block, week card, goal card).
- Filter chips (`db-filter`) are buttons with `aria-pressed`; the selected one uses `primary`.
