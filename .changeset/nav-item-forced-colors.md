---
'@astryxdesign/core': patch
---

[fix] The current page in a nav stays visible under Windows High Contrast. A selected `SideNavItem` (and any other `navItemStyles` consumer — `TopNavItem`, `TopNavMenu`, `TopNavMegaMenu`, `SideNavHeading`) marked its state with `--color-neutral`, a 6% background tint. `forced-colors: active` flattens backgrounds, so the tint resolved to 6% of the canvas colour over the canvas itself and the current page became indistinguishable from every other row — measured in Chromium under emulated forced colors, in light and dark. The selected row now paints `Highlight`/`HighlightText`, the platform convention already used by `ToggleButton` and `SegmentedControlItem`, and holds it through hover and press. A selected row's icon follows the row's colour rather than `--color-icon-primary`, which is the same value in every generated theme but is what lets the icon come along to `HighlightText` — without it the glyph stayed near-black on the Highlight fill, at 1.6:1. Nav rows are deliberately **not** opted out of UA colour remapping with `forced-color-adjust: none`: unlike those two native controls the system keywords land without it, and setting it would inherit into `endContent` and keep a `Badge`'s authored fill instead of remapping it.

@cixzhang
