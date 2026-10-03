---
'@astryxdesign/core': patch
---

[fix] Draw the row divider below a `useTableRowExpansion` detail panel rather than above it. (#5995)
@ernestt

An expanded row and its panel are one unit, but the divider was landing between them: the row drew its own bottom border, which put a line between the row and the detail it had just opened, and the panel drew none, so it ran flush into the next row. Both halves of that are backwards — the pair was split down the middle and then fused to the row below.

The expanded row now gives up its border and the panel takes one. On a table with no row dividers the suppression removes a border that was never there and the panel's is never applied, so neither side has to consult the divider mode; only the panel does, to know whether to draw at all. The panel row carries `tableRowMarker`, which is how `TableCell` scopes its "no trailing line under the last row" rule, so an expanded last row still ends the table cleanly.
