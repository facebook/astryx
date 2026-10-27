---
'@astryxdesign/core': patch
---

[feat] ChatLayout: dragging the conversation down to the composer and lifting there now dismisses the software keyboard, as in Messages, wherever ChatLayout keeps its composer on the keyboard (Safari on iOS, Firefox and Chrome for Android); a release moving back up keeps it. A finger drags, and so does a pen the browser reports as touches; in a desktop browser a mouse press, or a press of a pen reported as a pointer, already takes focus off the composer, so the keyboard leaves at the press. Where a page sets `interactive-widget=resizes-content`, Chrome resizes the page for the keyboard, ChatLayout measures no keyboard, and no drag dismisses it. A web page cannot move the system keyboard, so the keyboard leaves on its own at the lift instead of following the finger. Drags that start in the composer never dismiss it, and dismissing moves focus nowhere. Drag-to-dismiss has no caller control. Typing with a keyboard is unchanged.

@vjeux
