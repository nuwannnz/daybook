# ScheduleBlock

A time block on the day's schedule: a time label on the left and a tinted block in the project's tone.

- Calendar events use `db-tone--sky`; time-blocked tasks use their project's tone.
- The current time is a `db-now` row: the time in `rose-ink` and a 2px `now-line`.
- Gaps of 30 minutes or more show as a dashed `db-block--free` slot inviting a drag.
- Title in 14/600, meta (times · project) in 12px, both in the tone's ink.
