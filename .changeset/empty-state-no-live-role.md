---
'@astryxdesign/core': patch
---

[fix] EmptyState's root no longer carries `role="status"`, so it is not a live region that mounts already holding its text, which screen readers announce unreliably (`spec:AST-086` FR2). Apps need no code change. What changes for assistive technology:

- An EmptyState that renders with the page announces nothing.
- One that appears later, for example after a search or a load returns nothing, announces its title and description once through the shared polite live region.
- Inside a live container such as `ChatMessageList`'s log, the container announces it, not EmptyState (`spec:AST-086` FR4).
- When the title or description of a shown EmptyState changes, the new text is announced once.
- A `role` you pass now reaches the root instead of being replaced.

Tests that found EmptyState with `getByRole('status')` need another selector.

@harjothkhara
