---
'@astryxdesign/core': patch
---

[feature] `useAnimatedLayout({containerRef})` returns an opaque handle for an area (`spec:AST-105`). A component whose size changes takes it and reports each change, and the content after that component inside the container glides to its new place instead of jumping, on one shared motion role, under every pointer, a mouse included. Fixed and stuck sticky elements stay put, the glide never scrolls the container, and under Reduce Motion the change cross-fades on touch and happens at once with a mouse. No component takes the handle yet; Collapsible and TreeList adopt it next.

@cixzhang
