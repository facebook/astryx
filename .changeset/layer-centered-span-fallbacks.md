---
'@astryxdesign/core': patch
---

[fix] Layer: centered layers near a viewport edge no longer render clipped (#3671). Flip fallbacks are a no-op for center alignment, so centered placements now append span-based `position-try-fallbacks` that slide the layer along its alignment axis.

@AKnassa
