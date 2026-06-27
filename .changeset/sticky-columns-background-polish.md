---
'@astryxdesign/core': patch
---

[fix] Polish `useTableStickyColumns` pinned-cell backgrounds so they match the
rest of the row:

- Pinned cells paint an opaque base via the overridable
  `--table-sticky-background` variable (defaults to `--color-background-card`),
  fixing a grey mismatch in themes/modes where `surface !== card` (e.g. neutral
  dark). Consumers on a different backdrop override the variable.
- The row's hover overlay is replayed on the pinned cell via a background-image
  gradient (`--color-overlay-hover`), so hover highlights the whole row
  including pinned columns; a transparent-gradient default keeps the transition
  smooth and in lockstep with the row.
- `background-clip: padding-box` keeps the row divider visible on pinned cells.
@humbertovirtudes
