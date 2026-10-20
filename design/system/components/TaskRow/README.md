# TaskRow

One task: a checkbox, its title and its project chip, the whole row a `<label>` so it is easy to tick.

- Minimum 48px tall; rows sit inside a `db-list` card.
- Done tasks get `db-task--done`: title in `ink-done` with line-through. They stay in place until the next day so progress is visible.
- The checkbox uses `accent` via `accent-color`.
- Completing shows an Undo toast; never a confirmation.
