---
'@astryxdesign/core': patch
---

[perf] Scrolling a `ScrollableArea`, or any viewport that uses `useScrollableArea` (Table, CodeBlock, BottomSheet's body), no longer reads computed style on each frame. Before, every scroll event triggered a full measurement in the next animation frame: four computed-style reads plus geometry. When something else on the page had changed style earlier in that frame, this forced a style recalculation from script. Now the scroll event works out the logical edges from box geometry alone, before animation-frame callbacks run, so `state` and the `data-scroll-*-start` / `data-scroll-*-end` attributes update in the frame that scrolled rather than the next one. Size, style and writing-mode changes still trigger a full measurement, at most once per frame.

@vjeux
