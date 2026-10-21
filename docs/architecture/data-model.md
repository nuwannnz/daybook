# Data model

How the PRD's [data model](../product/PRD.md#data-model) maps onto one DynamoDB table per environment ([ADR 0005](../decisions/0005-dynamodb-single-table.md)).

## Table

| Setting | Value |
| --- | --- |
| Name | `daybook-{env}` |
| Billing | On-demand, with maximum read and write throughput set |
| Keys | `PK` (string), `SK` (string) |
| Indexes | `GSI1` (`GSI1PK`, `GSI1SK`), `GSI2` (`GSI2PK`, `GSI2SK`), both projecting all attributes |
| TTL | `expiresAt` (tombstones) |
| Recovery | Point-in-time recovery in prod |
| Encryption | AWS-owned key |

Every item has `PK = USER#{userId}`, `entity`, `id`, `version`, `createdAt`, `updatedAt`. Ids are ULIDs generated on the client.

## Items

| Entity | SK | GSI1 (change feed and day/backlinks) | GSI2 (grouping) |
| --- | --- | --- | --- |
| Project | `PROJECT#{projectId}` | change feed | `GSI2PK = USER#{u}#PROJECTS#{status}`, `GSI2SK = {order}` |
| Milestone | `PROJECT#{projectId}#MS#{milestoneId}` | change feed | — |
| Task | `TASK#{taskId}` | change feed | see Task indexes below |
| Note (metadata) | `NOTE#{noteId}` | change feed | `GSI2PK = USER#{u}#NOTES#{kind or projectId}`, `GSI2SK = {updatedAt}` |
| Note document | `NOTE#{noteId}#DOC` | — | — |
| Daily note pointer | `DAILY#{date}` | — | — |
| Weekly goal | `WEEK#{isoWeek}#PROJECT#{projectId}` | change feed | `GSI2PK = USER#{u}#GOALS#{projectId}`, `GSI2SK = {isoWeek}` |
| Top 3 slot set | `TOP3#{date}` | change feed | — |
| Carry-over decision | `CARRYOVER#{date}` | — | — |
| Link | `LINK#{fromId}#{toId}` | `GSI1PK = USER#{u}#LINKTO#{toId}` | — |
| Settings | `SETTINGS` | change feed | — |

### Task indexes

Tasks need three views: by day, by project or milestone, and the unscheduled tray. The `GSI2` key is chosen when the task is written:

| Task state | `GSI2PK` | `GSI2SK` |
| --- | --- | --- |
| Scheduled | `USER#{u}#DAY` | `{scheduledDate}#{order}` |
| Unscheduled, in a project | `USER#{u}#TRAY` | `{projectId}#{order}` |
| Unscheduled, no project (Inbox) | `USER#{u}#INBOX` | `{order}` |

Project and milestone views query the base table with `SK begins_with TASK#` filtered by `projectId`. That is a full read of the user's tasks, which is fine at personal scale (hundreds to low thousands of items). If it becomes slow, add `GSI3` keyed on `projectId`; the `TaskRepository` interface does not change.

### Change feed

Every mutable item also sets `GSI1PK = USER#{u}#CHANGES` and `GSI1SK = {updatedAt}#{entity}#{id}`, except Links, which use `GSI1` for backlinks and write a change-feed marker on the source note instead. `GET /api/changes?since=` queries `GSI1SK > since`. Deletes write a tombstone item (`entity = Tombstone`, `expiresAt` 30 days out) so other devices see removals.

## Access patterns

| # | Pattern | Operation |
| --- | --- | --- |
| 1 | Today's tasks (TOD-3) | Query `GSI2` `USER#{u}#DAY`, `GSI2SK begins_with {date}` |
| 2 | Week board (WK-3) | Query `GSI2` `USER#{u}#DAY`, `GSI2SK between {monday} and {sunday}~` |
| 3 | Unscheduled tray (WK-5) | Query `GSI2` `USER#{u}#TRAY` |
| 4 | Inbox (CAP-4) | Query `GSI2` `USER#{u}#INBOX` |
| 5 | Top 3 for a day (TOD-2) | Get `TOP3#{date}` |
| 6 | Sidebar projects (NAV-1) | Query `GSI2` `USER#{u}#PROJECTS#active` |
| 7 | Project page (PRJ-2, PRJ-3) | Get project, query `SK begins_with PROJECT#{id}#MS#`, tasks per pattern note above |
| 8 | Weekly goals (WK-2) | Query base `SK begins_with WEEK#{isoWeek}#` |
| 9 | Note list by filter (NOT-1) | Query `GSI2` `USER#{u}#NOTES#{filter}`, newest first |
| 10 | Open a note | Get `NOTE#{id}` and `NOTE#{id}#DOC` |
| 11 | Daily note for a date (TOD-8) | Get `DAILY#{date}`, then pattern 10 |
| 12 | Backlinks (NOT-4) | Query `GSI1` `USER#{u}#LINKTO#{id}` |
| 13 | Carry-over shown? (TOD-5) | Get `CARRYOVER#{date}` |
| 14 | Changes since cursor | Query `GSI1` `USER#{u}#CHANGES`, `GSI1SK > cursor` |
| 15 | Search (NAV-2, MVP) | Query base `PK`, filter on lower-cased `searchText`, behind `SearchIndex` port |
| 16 | Account export | Query base `PK`, paginate everything |

## Invariants and how they are enforced

| Rule (PRD) | Enforcement |
| --- | --- |
| At most three Top 3 tasks per day | `TOP3#{date}` holds the ordered task ids; pin and unpin are a transaction updating it and the task, with `size(taskIds) < 3` as a condition. The fourth-pin swap is one transaction. |
| One daily note per date, created on first keystroke | Conditional put of `DAILY#{date}` with `attribute_not_exists(SK)`; the loser reads the winner's note id. |
| One weekly goal per project per week | The SK itself is unique; conditional put. |
| Carry-over banner shows once per day | Conditional put of `CARRYOVER#{date}`. |
| Progress on project page equals weekly goal card | Both computed by the same `domain` function over the same task query. |
| Lost updates | Every update has `version = :expected` as a condition; conflicts return `409` and the client refetches. Task fields merge last-writer-wins by `updatedAt`. |

## Notes storage

- `NOTE#{id}` holds the metadata: `title`, `kind` (daily, project, idea), `projectId`, `date`, `pinned`, `searchText` (first 2,000 characters, lower-cased), `wordCount`.
- `NOTE#{id}#DOC` holds `yState` (binary, Yjs encoded state), `snapshot` (block JSON for export and link extraction) and `version`.
- If `yState` exceeds 300 KB, the `NoteDocumentStore` adapter stores it in S3 and keeps a pointer. A 5,000-word note is about 40 KB, so this is an edge case.

## Size and cost notes

- Item size limit is 400 KB; nothing but note documents comes close.
- A heavy user (5 projects, 2,000 tasks, 500 notes) is well under 50 MB, inside the 25 GB always-free storage.
- On-demand writes are $0.625 per million and reads $0.125 per million; MVP traffic costs cents.
