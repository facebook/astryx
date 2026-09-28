---
'@astryxdesign/core': patch
---

[fix] Markdown: table columns keep a content-derived width floor and headers stop truncating.

A Markdown table in a narrow reading column no longer squashes every column to a
few characters. Each column keeps a floor derived from its own content, measured
in characters on the cell's text box, so a column is never narrower than its
longest unbreakable token and cell padding does not eat into the floor.
Identifiers, URLs, and inline code stay whole, header labels wrap instead of
ellipsizing, and a table that is genuinely wider than its container scrolls in
Table's own scroll region — which is now the table's only scroll viewport,
accessible name, and keyboard stop.

@nynexman4464
