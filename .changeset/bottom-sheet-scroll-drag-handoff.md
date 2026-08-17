---
'@astryxdesign/core': patch
---

[fix] BottomSheet: an upward pull at the bottom of scrolled content no longer hijacks the gesture when the sheet is already fully expanded. It used to hand off to a sheet drag with nowhere to expand to, producing a rubber-band the release threw straight back, and — because the handoff swallows the rest of the gesture — leaving the content unscrollable until the finger lifted, so dragging back down collapsed the sheet instead of scrolling. The bottom edge now hands off only when a taller detent exists.

@imdreamrunner
