---
'@astryxdesign/core': patch
---

[fix] `useTableGroupedRows`: the section heading stays on screen when the table
scrolls sideways

A group header is one cell spanning every column, so on a table scrolled
sideways its chevron and label slid out of view while the columns they named
stayed pinned — leaving unlabelled grey bands and no way to collapse a section
without scrolling back. The heading now sticks to the table's start edge.

The cell's start gutter moves onto the heading itself so that it travels with
it; left on the cell, the heading would sit one gutter in at rest and jump
flush the moment it stuck.

This was previously only patchable halfway from userland: `renderGroupHeader`
can pin its own content, but the chevron is the plugin's and sits outside it,
so the two would come apart.

@ernesttien
