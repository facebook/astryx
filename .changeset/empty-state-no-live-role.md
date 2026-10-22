---
'@astryxdesign/core': patch
---

[fix] EmptyState's root no longer carries `role="status"`; EmptyState adds no live role or `aria-live`. It usually mounts already holding its text, so the announcement was unreliable, and as ordinary page content it is not a status message. This conforms to spec:AST-086 FR2, which gives any announcement of an empty result to the code that produced it (for example through `useAnnounce`). A `role` you pass now reaches the root instead of being replaced. Tests that found EmptyState with `getByRole('status')` need another selector.

@harjothkhara
