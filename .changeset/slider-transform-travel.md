---
'@astryxdesign/core': patch
---

[perf] Slider: the thumbs and the filled range move by `translate` in the control's container units instead of by inset and width, so dragging or stepping a slider no longer lays out the page on every value change. Rendering is unchanged.

@vjeux
