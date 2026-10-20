# MilestoneRow

A collapsible stage of a project: number, name, dates, status and task count; it expands to show its tasks.

- The header is a `<button>` with `aria-expanded`. The active milestone opens by default and gets `db-milestone--active` (a `lavender-dot` border).
- Status chips: Done (`db-tone--mint`), In progress (`db-tone--lavender`), Up next (`db-tone--inbox`).
- Task count reads “done/total”, in `ink-muted`.
