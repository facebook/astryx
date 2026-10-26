---
'@astryxdesign/core': patch
---

[feature] `useAnimatedLayout({containerRef})` returns a handle that Collapsible and TreeList take as their new `animatedLayout` prop (`spec:AST-105`). When one of them opens or closes, the content after it inside that container glides to its new place instead of jumping, on one shared motion role with the revealed content and the chevron, under every pointer, a mouse included. Fixed and stuck sticky elements stay put, the glide never scrolls the container, and under Reduce Motion the change cross-fades on touch and happens at once with a mouse. Without the prop, nothing changes.

@cixzhang
