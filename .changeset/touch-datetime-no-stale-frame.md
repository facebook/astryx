---
'@astryxdesign/core': patch
---

[fix] DateTimeInput's touch picker no longer paints a stale frame. Clearing the value from outside clears the time display in the same update, instead of showing the previous time for one frame, and narrowing `max` (or raising `min`) while the sheet is open keeps the visible month in range in the same update, instead of showing the out-of-range month and then jumping.

@cixzhang
