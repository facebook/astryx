---
'@astryxdesign/core': patch
---

[feat] Add an opt-in bulk-actions toolbar to `useTableSelection` via a new `bulkActions` config (#5486). The default `fixed` layout renders a borderless full-bleed band in flow; `layout: 'floating'` renders a rounded bar 16px above the table without shifting it. Both layouts place ghost action buttons on the logical start side and the count, optional "select all N matching" link, and optional localized clear-selection control on the logical end side. Off by default: tables that omit `bulkActions` are unchanged.

@humbertovirtudes
