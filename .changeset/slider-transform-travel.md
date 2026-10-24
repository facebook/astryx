---
'@astryxdesign/core': patch
---

[perf] Slider: the thumbs and the filled range move by `translate` in the control's container units instead of by inset and width, so moving the thumbs and the fill no longer lays out the page; with `valueDisplay="none"` a drag or step lays out nothing at all (the value tooltip and text display still lay out as their text changes). Rendering is unchanged.

@vjeux
