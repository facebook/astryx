---
'@astryxdesign/core': patch
---

[feature] `useAnimatedLayout({containerRef})` returns a handle that Collapsible and TreeList take as their new `animatedLayout` prop: when one of them opens or closes, the content after it, up to that container, glides to its new place instead of jumping, and the chevron turns on the same timing. Fixed and stuck sticky elements stay put, and under Reduce Motion the content cross-fades instead of moving. Without the prop, nothing changes.

@cixzhang
