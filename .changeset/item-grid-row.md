---
'@astryxdesign/core': patch
---

[feat] `Item` gains a grid-row shape: under `role="row"` the row renders its parts as `gridcell`s — the marker, the start content, the label with its description, the end content and each swipe panel — and keeps its own control (the invisible anchor for `href` or button for `onClick`) in the label cell, where `controlProps` carries a grid's roving `tabIndex`, its marks and its key handling. `isSelected` is the row's `aria-selected`. Swipe actions are available on a grid row, per `spec:AST-057`'s rule (a role whose cells admit interactive descendants): the revealed entries are buttons inside a `gridcell`. Before this, a `role="row"` Item rendered no control (the label in a plain span, `onClick` on the root, `href` ignored) and added no tab stop; a caller that relied on that keeps its grid's keyboard model but now finds the row's anchor or button in the label cell, and sets its `tabIndex` through `controlProps`. Every other role is unchanged.

@vjeux
