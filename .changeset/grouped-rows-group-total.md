---
'@astryxdesign/core': patch
---

[feat] `useTableGroupedRows`: `getGroupTotal`, so a section that is still
loading counts the result set rather than the page

Grouping runs on the rows it is handed. Under pagination or infinite scroll
that is one page, so a heading read "Northwind (6)" — a number shaped like a
total that was really a progress meter, and that silently became "(10)" as the
reader scrolled. There was no way to tell a finished section from a filling one.

`getGroupTotal(groupKey)` reports how many rows the section holds overall. The
heading then reads `Northwind (6 of 10)` until the section is fully loaded and
`Northwind (10)` after. Return `undefined` for a group whose total is unknown
and it falls back to the page count, so partial knowledge is fine.

`renderGroupHeader` now receives `total` as a fourth argument. Existing
renderers are unaffected — they take the first three.

The default heading's "of" is a new translated string,
`@astryx.tableGroupedRows.partialCount`, so the pair reads in the reader's
locale rather than assembling English in the component.

Both the hook's docs and its reference page also now spell out the ordering
this pairs with: filter, sort, slice, then group, sorting by the group key
ahead of the reader's own keys. That keeps a section's rows contiguous, so
pages append to the bottom of the table instead of splicing rows in above the
fold and materialising new headings mid-scroll.

@ernesttien
