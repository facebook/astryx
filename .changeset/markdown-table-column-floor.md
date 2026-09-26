---
'@astryxdesign/core': patch
---

[fix] Markdown table columns keep a content-derived width floor.

A Markdown table column is never narrower than its longest unbreakable token,
and prose columns get a readable minimum derived from their own content instead
of a fixed 60/80/120px bucket. Header cells wrap like body cells instead of
truncating, inline code in a cell stays whole, and a table wider than its
container scrolls instead of squashing every column to a few characters.

@cixzhang
