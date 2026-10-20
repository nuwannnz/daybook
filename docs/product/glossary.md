# Glossary

## Product terms

| Term | Meaning |
| --- | --- |
| Task | A stored item with a title, optional project, milestone, day and time block. No project means Inbox. |
| Project | Long-running work with a goal, colour, dates, milestones and weekly goals. |
| Milestone | A dated stage inside a project that groups its tasks (Discovery, Wireframes, Launch). |
| Note | A daily, project or idea note that can link to days, projects and tasks. |
| Daily note | One free-form note per day, created on the first keystroke. |
| Top 3 | Up to three tasks flagged as the day's focus. |
| Also today | Every other task scheduled for the day. |
| Inbox | Where captured tasks with no project land. |
| Weekly goal | One sentence per project per week; progress comes from its linked tasks. |
| Tray | The "Not scheduled yet" list of project tasks with no day. |
| Carry-over | Unfinished tasks offered back the next day; never rolled over automatically. |
| Day boundary | 04:00 local time; work before then still counts as the previous day. |
| Capture bar | The single input that saves a task or note from anywhere (⌘K / Ctrl+K). |

## Technical terms

| Term | Meaning |
| --- | --- |
| Port | An interface the application layer depends on, such as `TaskRepository` or `Clock`. |
| Adapter | A concrete implementation of a port, such as `DynamoTaskRepository`. |
| Command | An object describing one state change (`CompleteTask`); web commands also know how to undo. |
| Facade | A web hook (`useTodayFacade`) giving a feature's components view models and intents. |
| Composition root | The `main` file of an app where adapters are wired to ports. |
| Change feed | The `GSI1` index listing items by `updatedAt`, polled by clients for cross-device updates. |
| Yjs state | The binary CRDT document that holds a note's body. |
| Web Function | An AWS Lambda Web Function: a port-listening HTTP server running on Lambda. |
| OAC | CloudFront origin access control; signs requests from CloudFront to S3 and the Web Function. |
| EMF | CloudWatch Embedded Metric Format; metrics written as structured log lines. |
