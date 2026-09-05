---
'@astryxdesign/core': patch
---

[fix] Layout: add region `height="auto" | "fill"` control for shared middle scrolling.

`LayoutContent` and `LayoutPanel` now accept `height`, defaulting to `"fill"` for compatibility. In a fill-height `Layout`, regions with `height="auto"` use their natural height and move together in a keyboard-focusable middle scrollport, while `height="fill"` regions remain pinned. `isScrollable` retains its released meaning and only controls each region's own overflow. The full start + content + end composition stays inside `contentWidth`; for arithmetic widths the middle scrollbar can extend through the surrounding Layout gutters.

@kentonquatman
