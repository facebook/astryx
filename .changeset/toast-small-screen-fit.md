---
'@astryxdesign/core': patch
---

[fix] Toast on small screens: the viewport's edge gutter now clears the device safe area (notch, home indicator, rounded corner) on all four edges — physically on the inline axis, so RTL gets the gutter on the right edge — and a toast sizes itself against that gutter instead of subtracting a hardcoded 32px from `100vw`. A body with no break opportunity (a URL, a long translated compound) wraps instead of overflowing, and the trailing controls are pinned to one line box so they stay level with the first line when the message wraps. The stack gap tightens from 12px to 8px, and a toast pushed past `maxVisible` collapses out (and expands back in) instead of blinking the stack by its own height. A toast slides in from — and back out towards — the edge its stack is pinned to, rather than always from below. The viewport only advertises its "Notifications" landmark while it is actually holding a toast, which also stops nested viewports from publishing the landmark twice.

@imdreamrunner
