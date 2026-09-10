---
'@astryxdesign/core': patch
---

[feat] New `useTableStickyHeader` plugin pins a table's header row to the top of its scroll container, so column headings stay readable while the body scrolls. Pass `maxHeight` to give the table a scrollport of its own, or omit it when an ancestor already bounds the height. Composes with `useTableStickyColumns`: install both and the corner cell where the pinned column crosses the pinned header stays above both runs, in either plugin order. Header cells are transparent by default, so the plugin also gives them the opaque `--table-sticky-background` the pinned column already uses — one override now covers both.
@ernestt
