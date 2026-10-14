---
'@astryxdesign/core': patch
---

[fix] `ContextMenu` paints in Safari when its trigger sits inside a scroll container. The menu is anchored to a box at the pointer, and that box was empty: WebKit counts an empty anchor box inside a scroller as clipped, so the default `position-visibility: anchors-visible` hid the open menu. The anchor is now 1px, kept inside the trigger, so the menu still hides while a scroller clips the pointer position and paints again when it scrolls back. A pointer-opened menu now starts 1px lower, below the pixel under the pointer.

@vjeux
