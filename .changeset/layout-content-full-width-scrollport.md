---
'@astryxdesign/core': patch
---

[fix] Layout: keep content scrollbars at the content area's outer edge when `contentWidth` is set.

Without panels, `LayoutContent` spans the available Layout width and aligns its children to `contentWidth` internally. With exactly one panel, the panel stays aligned to the `contentWidth` frame while content extends across the opposite open area. A two-panel layout keeps the complete composition constrained.

@kentonquatman
