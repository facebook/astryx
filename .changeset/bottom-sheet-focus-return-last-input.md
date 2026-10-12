---
'@astryxdesign/core': patch
---

[fix] `BottomSheet` returns focus without a focus ring after a pointer close (a tap in WebKit, or a pointer close of a sheet opened from the keyboard) and keeps the ring after a keyboard close, including on a `DropdownMenu` bottom-sheet trigger the caller renders (`renderTrigger`). The sheet now asks the browser not to treat that focus as keyboard focus, the way Dialog's focus moves do.

@vjeux
