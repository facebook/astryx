---
'@astryxdesign/core': patch
---

[fix] A `DropdownMenu` whose trigger the caller renders (`renderTrigger`) returns focus to it without a focus ring after a pointer pick (a mouse click in Chromium, a click or a tap in WebKit), as the built-in trigger already did: the menu now asks the browser not to treat that focus as keyboard focus, the way Dialog's focus moves do.

@vjeux
