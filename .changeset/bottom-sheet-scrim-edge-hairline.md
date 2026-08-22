---
'@astryxdesign/core': patch
---

[fix] BottomSheet: give the sheet one uniform edge against the scrim. Two things were wrong in dark mode. The sheet drew no edge of its own — surface and scrim sit a few RGB steps apart and the `--shadow-high` drop shadow is black on near-black, so the left and right edges were invisible (measured 1.16:1 boundary contrast in dark against 2.89:1 in light); it now carries a `--border-width` / `--color-border` hairline on its three scrim-facing edges, the same treatment MobileNav gives its scrim-facing edge. And under a theme that packs an inset ring into `--shadow-high` (every bundled theme adds one in dark mode) that ring was painted over by an opaque content wrapper such as `Section`, so it showed only in the gap below where the content ended and the side edges appeared to change width partway down; the scrolling body now paints the surface across the sheet's whole inner box, hiding the ring evenly (#5305).

@imdreamrunner
