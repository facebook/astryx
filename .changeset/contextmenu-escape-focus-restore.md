---
'@astryxdesign/core': patch
---

[fix] ContextMenu: Escape now closes the menu even when it was opened without auto-focus (e.g. table row menus), via a document-level Escape listener instead of one that only fires when focus is inside the menu. Focus is also restored to the previously focused element on close, instead of falling to `<body>`. Escape during IME composition is ignored (#3343).
@cixzhang
