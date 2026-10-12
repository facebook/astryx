---
'@astryxdesign/core': minor
---

[breaking] `PowerSearchFilterEditor` no longer calls `onSave` when it opens on an already-complete empty-operator filter (such as "is empty"). (#7347)

Old usage: opening a standalone `PowerSearchFilterEditor` on a complete empty-operator filter saved that filter immediately, with no Apply rendered for it, and saved it again whenever the editor remounted.

Replacement: the editor saves only from a user choice in it. Opening it saves nothing.

Migration: if you relied on that save-on-open, call your own `onSave` handler with the filter at the point where you open the editor (or skip opening the editor for empty-operator filters, as PowerSearch now does). This cannot be rewritten by a codemod, because the right place to commit depends on your code.

@cixzhang
