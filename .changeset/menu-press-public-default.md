---
'@astryxdesign/core': patch
---

[feature] `useMenuPress` with no `longPressDelayMs` now opens the menu as a finger presses on a touch screen too (a coarse primary pointer), with DropdownMenu's timing (`spec:AST-094` FR25, FR29); pass `longPressDelayMs: 500` to keep the previous 500 ms hold. Where the primary pointer is fine it keeps the 500 ms hold.

@vjeux
