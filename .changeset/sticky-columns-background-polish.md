---
'@astryxdesign/core': patch
---

[fix] Polish `useTableStickyColumns` pinned-cell backgrounds so they match the
rest of the row:

- Pinned cells paint an opaque base via the overridable
  `--table-sticky-background` variable (defaults to `--color-background-card`),
  fixing a grey mismatch in themes/modes where `surface !== card` (e.g. neutral
  dark). Consumers on a different backdrop override the variable.
- The row's overlay (striping and/or hover) is replayed on the pinned cell via
  a background-image gradient. `TableRow` publishes its current overlay color as
  the inheritable `--table-row-overlay` variable, so pinned columns mirror the
  row exactly — striped when the table is striped, hover when enabled, nothing
  otherwise (no phantom stripes) — transitioning in lockstep with the row.
- `background-clip: padding-box` keeps the row divider visible on pinned cells.
@humbertovirtudes
