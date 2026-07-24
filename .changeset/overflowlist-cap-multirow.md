---
'@astryxdesign/core': patch
---

[feat] OverflowList: add `maxVisibleItems` to cap the number of visible items (the ceiling partner to `minVisibleItems`) and `maxRows` for bounded multi-row wrapping — items wrap onto up to N rows, then collapse into the overflow indicator. Both props are optional and default to off, so single-line behavior is unchanged. See #4176.

@cixzhang
