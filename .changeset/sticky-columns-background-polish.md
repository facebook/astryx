---
'@astryxdesign/core': patch
---

[fix] Polish `useTableStickyColumns` pinned-cell backgrounds so they match the
rest of the row:

- Pinned cells now paint an opaque base via the overridable
  `--table-sticky-background` variable (defaults to `--color-background-card`),
  fixing a grey mismatch in themes/modes where `surface !== card` (e.g. neutral
  dark). Consumers on a different backdrop set the variable.
- Striped / hover overlays are mirrored from the row exactly: `TableRow` now
  publishes its current overlay color as the inheritable `--table-row-overlay`
  variable, which pinned cells replay on a `::before` layer. This fixes phantom
  stripes on the pinned column (it stripes only when the table is striped) and
  hover only showing on non-sticky cells.
- The overlay transitions `background-color` in lockstep with the row, removing
  the hover lag that appeared when the pinned column wasn't overlapping content.
- Preserves the row divider on pinned cells (`background-clip: padding-box`).
  @humbertovirtudes
