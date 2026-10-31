---
'@astryxdesign/core': patch
---

[feat] `useScrollableArea` accepts one element as both its viewport and its content box, and then observes that element's direct children, so a scroller whose content has no wrapper of its own can be measured without adding one.

@vjeux
