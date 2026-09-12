---
'@astryxdesign/core': patch
---

[fix] SideNav: stop a resizable nav's handle from creating a horizontal scrollbar in AppShell (#6177)

`ResizeHandle`'s overlay mode positions an intentionally oversized hit area with a transform offset that can extend a fraction of a pixel past the nav's own width. The wrapper `SideNav` renders around the nav and handle didn't clip that bleed itself, so it reached AppShell's scrollable `LayoutPanel` and surfaced as a real 1px horizontal scrollbar. Adds `overflow: 'clip'` to that wrapper, matching what `ResizeHandle`'s own overlay-mode documentation already expects of its parent.

@HelloOjasMutreja
