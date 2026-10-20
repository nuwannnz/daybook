# 0006. Notes as Yjs documents with a TipTap editor

- Status: accepted
- Date: 2026-10-20

## Context

The PRD requires a block editor (headings, paragraphs, lists, checklists, bold, italic, links, Markdown shortcuts), autosave on every change, under 1 s of typing lost, typing under 16 ms in a 5,000-word note, and per-block merging when two devices edit the same note. Offline editing arrives in v1 ([0007](0007-online-first-mvp-with-redux.md)), so the format should not need to change then.

## Decision

- The note body is a Yjs document. The editor is TipTap (ProseMirror) with its Yjs collaboration binding, wrapped behind a `NoteEditor` component and a `NoteDocumentSync` port so the editor or CRDT can be swapped.
- The client batches local Yjs updates (flush after 300 ms idle, at most every 1 s) and posts them to `POST /api/notes/{id}/updates`. Unsent updates are buffered in IndexedDB (`y-indexeddb`) until acknowledged, which meets the 1 s durability rule without full offline mode.
- The server merges updates into the stored state with an optimistic version check and retries on conflict. It also writes a derived snapshot: title, plain text (for search), and block JSON (for export and NOT-4 link extraction).
- Other devices fetch the missing updates with `GET /api/notes/{id}/doc?stateVector=…` when the note is open and on poll.
- Note metadata and the Yjs state are separate items so note lists never load bodies.

## Consequences

- Concurrent edits merge at character level, stronger than the PRD's per-block rule; nothing is lost on conflict.
- Yjs state grows with history. Garbage collection stays on, and state is re-encoded on each server write. A note whose state exceeds 300 KB is moved to S3 by the `NoteDocumentStore` adapter; this is tracked in [open questions](../planning/open-questions.md).
- Yjs state is binary, so it never enters Redux; Redux holds only note metadata.
- Note history (NOT-7, P2) can be built from periodic Yjs snapshots later.
