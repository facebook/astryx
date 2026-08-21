---
'@astryxdesign/core': patch
---

[fix] BottomSheet: draw a hairline on the sheet's top and side edges so it separates from the scrim in dark mode. The surface fill alone did that job, which works in light mode but not in dark, where surface and scrim sit a few RGB steps apart and the `--shadow-high` drop shadow is black on near-black, leaving the sheet's left and right edges invisible (measured 1.16:1 boundary contrast in dark against 2.89:1 in light). Uses `--border-width` / `--color-border`, the same treatment MobileNav gives its scrim-facing edge; the block-end edge is left bare because it sits below the viewport.

@imdreamrunner
