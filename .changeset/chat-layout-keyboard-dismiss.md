---
'@astryxdesign/core': patch
---

[feat] ChatLayout: dragging the conversation down to the composer now dismisses the software keyboard, as in Messages. The new `keyboardDismissMode` prop works like a scroll view's mode on iOS: `'interactive'` (the default) dismisses the keyboard when the finger reaches the composer, `'onDrag'` dismisses it as soon as the conversation starts to scroll, and `'none'` leaves it up. A web page cannot move the system keyboard, so in interactive mode the keyboard leaves on its own instead of following the finger. Touches that start in the composer never dismiss it.

@vjeux
