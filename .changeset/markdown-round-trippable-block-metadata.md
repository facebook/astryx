---
'@astryxdesign/core': patch
---

[feat] Markdown: expose table alignment and the ordered-list delimiter in the DOM

The parser reads a table's per-column alignment and whether an ordered list was
written with `.` or `)`, and then keeps both to itself: alignment only ever
became a StyleX class, and the delimiter reached nothing at all. A consumer
reading rendered markdown back out — to copy a selection as markdown, to feed
it somewhere else — has to guess, and guesses wrong on `| ---: |` and on `1)`.

Table cells now carry `data-align` when the column declares one (omitted when
it does not), and an ordered list carries `data-delimiter`. Both follow the
design system's existing convention of reflecting what a component knows as a
data attribute, so nothing about the rendered appearance changes.

`Markdown` and `List` also forward the rest of `BaseProps`. Both declare it —
and `BaseProps` documents that `data-*`, `aria-*` and `role` are kept — but
each destructured a fixed set of props and forwarded only `data-testid`, so an
`aria-label` a consumer passed silently disappeared. What a component sets for
itself still wins: the block root stays `role="document"`, and a list that
renders its own header keeps that association rather than one pointed
elsewhere.

@lexs
