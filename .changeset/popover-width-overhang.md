---
'@astryxdesign/core': patch
---

[fix] Popover honours an explicit `width` up to the viewport instead of the span of viewport beside the trigger: an end-aligned 352px popover under a button near a panel edge now renders 352px and overhangs past the trigger rather than shrinking to the span. When neither side of a trigger placed above or below fits the width, the layer centers on the trigger and slides into view instead of clipping. Popovers without a width, and `useLayer`, are unchanged.

@vjeux
