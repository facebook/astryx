---
'@astryxdesign/core': patch
---

[fix] `Layout`, `MetadataList`, `NavHeadingMenuItem`, and `TopNavMegaMenuItem` now forward the `BaseProps` they accept — `id`, `aria-*`, `data-*`, and DOM event handlers — to their element instead of silently dropping them. `TopNavMegaMenuItem` also applies `xstyle`, `className`, and `style` in both its default and drawer modes, and forwards `tabIndex` in drawer mode. Component-owned attributes (`role="menuitem"`, `aria-disabled`, theme `data-*` metadata) still win over a colliding pass-through.

`NavHeadingMenu` keeps arrow-key navigation when an item's own `onKeyDown` calls `preventDefault()`; a menu-level `onKeyDown` or `onKeyDownCapture` that cancels still stops navigation. Clearing a live-region announcement now cancels writes still queued for the next frame, so a cleared message cannot reappear.

From #5656 by @harjothkhara.

@harjothkhara
