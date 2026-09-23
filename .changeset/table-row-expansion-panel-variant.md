---
'@astryxdesign/core': patch
---

[feat] `useTableRowExpansion` accepts `panelVariant`, and the detail panel now sits on the surface behind the table by default instead of on a wash of its own. (#5995)
@ernestt

The panel row painted `--color-background-muted` unconditionally, and being a `<tr>` the plugin builds itself, nothing a caller rendered could reach it.

The panel is the row's continuation, not a surface of its own, so it now takes whatever the table sits on — the same thing the row does. That keeps the plugin unopinionated about the table's background: a table on a `Card` no longer stacks a third surface, and a striped table no longer paints a band in the same token as its own stripe, which read as a data row rather than as a detail.

`panelVariant: 'muted'` keeps the wash for the case that wanted it — a bare table with no card, no dividers and no striping, where nothing else separates the panel from the data around it.

**This changes the default appearance.** A table relying on the wash gets it back with `panelVariant: 'muted'`; in dark themes there is nothing to get back, because `--color-background-muted` is a low-alpha near-black that is close to invisible over a dark card — dark has effectively been rendering `transparent` all along.
