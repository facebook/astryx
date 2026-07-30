---
'@astryxdesign/core': patch
---

[fix] RTL Phase 4b behavioral fixes: ChatMessageBubble grouped-bubble tail corners now use logical border radii so the tail follows reading direction (mirrors under RTL, text unaffected); Table sticky-column shadows make their `translateX` and gradient direction-aware so the shadow fades from the pinned edge toward scrolled content in both LTR and RTL instead of rendering inside-out, and gate shadow visibility on `Math.abs(scrollLeft)` so the start/end shadows still appear under RTL (where spec-compliant browsers report a negative `scrollLeft`); ResizeHandle's hit-area bias is now direction-aware (mirrors about center under RTL) and the pointer-drag delta reads the handle's computed direction so dragging resizes intuitively in RTL.
@nynexman4464
