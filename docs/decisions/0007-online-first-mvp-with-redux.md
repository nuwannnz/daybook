# 0007. Online-first MVP with Redux Toolkit; offline moves to v1

- Status: accepted
- Date: 2026-10-20

## Context

The original PRD made full offline operation and an offline-first sync engine P0 for the MVP. Building a local-first store, an outbox and per-field conflict merging before any feature is the largest risk to shipping the private beta. The owner chose an online-first MVP.

## Decision

- The MVP is online-first. The server is the source of truth; the client caches server state and applies optimistic updates.
- Client state uses Redux Toolkit:
  - RTK Query for server state, with optimistic updates (`onQueryStarted` patches rolled back on failure), `refetchOnFocus` and `refetchOnReconnect`.
  - Slices only for UI state (selected day, open sheets, undo stack, capture draft).
- Cross-device freshness: while the app is visible, the client polls `GET /api/changes?since={cursor}` every 5 s and invalidates the affected cache tags. Polling stops when the tab is hidden.
- Task conflicts are field-level last-writer-wins on the server using `updatedAt`; notes merge through Yjs ([0006](0006-notes-as-yjs-documents.md)).
- When offline, the app shows a quiet "Offline, changes paused" banner and disables writes, except note typing, which buffers in IndexedDB.
- The PRD is updated: offline operation moves to v1 (P1), and the MVP gate becomes "no data lost while online; testers use it daily".

## Consequences

- Much smaller MVP; no sync engine to build and test first.
- The polling endpoint keeps the API warm while the app is open, which feeds the Web Functions cost risk ([0003](0003-fastify-api-on-lambda-web-functions.md)).
- Moving to offline in v1 means adding a persistent local store under the same RTK Query endpoints and an outbox for commands. Commands are already explicit objects ([0011](0011-layered-architecture-ports-and-adapters.md)), so they can be queued.
