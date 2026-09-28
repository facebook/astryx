---
'@astryxdesign/core': patch
---

[fix] Popover honours an explicit `width` up to the viewport instead of the span of viewport beside the trigger: an end-aligned 352px menu under a button near a panel edge now renders 352px and overhangs past the trigger rather than shrinking to 259px. When neither side of the trigger fits the width, the layer centers on the trigger and slides into view (a new `hasSlideFallback` render option on `useLayer` adds the `span-all` fallbacks). Popovers without a width are unchanged.

@vjeux
