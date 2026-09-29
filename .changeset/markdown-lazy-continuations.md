---
'@astryxdesign/core': patch
---

[fix] Markdown: keep lazy continuation lines inside blockquotes and list items

Wrapped paragraph lines may omit repeated blockquote markers or list indentation without escaping their owning container. Nested, ordered, unordered, and task-list continuations now preserve their rendered structure, text projection, and source range.

@cixzhang
