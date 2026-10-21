# 0005. DynamoDB single-table design

- Status: accepted
- Date: 2026-10-20

## Context

The PRD data model has Project, Milestone, Task, Note, WeeklyGoal, CarryOverDecision and Link, all owned by one person. Views (Today, This week, Project, Notes) are queries over the same tasks. The database must cost cents at low traffic and need no servers.

## Decision

- One on-demand DynamoDB table per environment, `daybook-{env}`, with every item partitioned by user (`PK = USER#{userId}`).
- Two overloaded global secondary indexes serve the view queries; see [architecture/data-model.md](../architecture/data-model.md) for keys and access patterns.
- Uniqueness rules (one daily note per date, one weekly goal per project per week, one carry-over decision per day, at most three Top 3 tasks per day) are enforced with conditional writes and transactions, not in application memory.
- Every item carries `updatedAt` and `version` for optimistic concurrency and the change feed used for polling.
- On-demand capacity with a table-level maximum throughput cap as a cost guard; point-in-time recovery on in prod.
- All database access goes through repository interfaces in the application layer; the DynamoDB adapters are the only code importing the AWS SDK for DynamoDB.

## Consequences

- Each person's data sits in one item collection, so the view queries are single-partition and cheap.
- There is no full-text search in DynamoDB; MVP search (NAV-2) runs a filtered query over the user's partition behind a `SearchIndex` port, swappable for a real index later.
- Item size is capped at 400 KB, which shapes note storage ([0006](0006-notes-as-yjs-documents.md)).
