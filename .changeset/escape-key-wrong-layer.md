---
'@astryxdesign/core': patch
---

[fix] Escape now dismisses only the top-most overlay when a `Lightbox` or `MobileNav` is layered on top of a `Dialog`. `Dialog` already deferred to any popover-style overlay via the shared focus-trap Escape stack, but `Lightbox` and `MobileNav` never registered on it, so a single Escape press closed the `Dialog` underneath instead of the overlay on top. Both now register on the shared stack while open (via the new `useEscapeStackEntry` hook), so `Dialog` correctly defers to them.

Also fixes `InfoTip` (lab): dismissing its own tooltip on Escape only called `stopPropagation`, not `preventDefault`, so a `Dialog` behind it still closed via its native top-layer close-watcher on the same press.

@HelloOjasMutreja
