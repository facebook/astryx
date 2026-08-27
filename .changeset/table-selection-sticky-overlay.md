---
'@astryxdesign/core': patch
---

[fix] `useTableSelection`: the checked-row wash now survives a frozen column

A sticky cell paints an opaque background of its own so scrolled content can't
show through, then replays the row's fill on a `::before` layer from
`--table-row-overlay`. `TableRow` publishes that variable alongside every
background it sets, which is how striping and hover carry across the freeze
line. Selection did not: it wrote `backgroundColor` on the `<tr>` and stopped
there, so a checked row lost its accent wash under every pinned column — the
row read as selected on the scrollable side and unselected on the frozen one.

The wash and the variable are now written together, and withdrawn together
when a row is unchecked or `hasRowHighlight` is turned off.

@ernesttien
