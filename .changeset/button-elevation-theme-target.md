---
'@astryxdesign/core': patch
---

[fix] `Button` now reflects `elevation` as a theme target. The prop selected between four StyleX style objects but was missing from the sibling `themeProps('button')` call, so `data-elevation` never reached the DOM and no theme could style the axis — the same defect fixed on `Card` in #5491, and one `ButtonGroup` already had right. A button inside a `ButtonGroup` reports `none`, because the group owns the surface's elevation and the member paints flat. Every wrapper that forwards `ButtonProps` through to `Button` — `IconButton` — picks the reflection up with it. (`ToggleButton` does not: its props extend `BaseProps`, not `ButtonProps`, so it has no `elevation` to forward and keeps reporting `none`.) Nothing about the rendered button changes: 60 of 64 captured frames are byte-identical, and the four that differ do so only inside the loading spinner's own box.

@cixzhang
