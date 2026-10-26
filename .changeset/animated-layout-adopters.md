---
'@astryxdesign/core': patch
---

[feature] Collapsible and TreeList take an `animatedLayout` prop: pass the handle from `useAnimatedLayout({containerRef})` and opening or closing glides the content after them inside that container instead of jumping (`spec:AST-105`). The revealed content reveals, closing content conceals before it hides, and the chevron turns, all on the same motion, under every pointer. A single-mode CollapsibleGroup glides every item it changes. Without the prop, nothing changes.

@cixzhang
