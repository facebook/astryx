---
'@astryxdesign/core': patch
---

[feat] ChatLayout: dragging the conversation down to the composer and lifting there now dismisses the software keyboard, as in Messages, wherever ChatLayout keeps its composer on the keyboard (Safari on iOS, Firefox and Chrome for Android); a release moving back up keeps it. Every pointer drags: a finger, a pen or a mouse. Where a page sets `interactive-widget=resizes-content`, Chrome resizes the page for the keyboard, ChatLayout measures no keyboard, and no drag dismisses it. A web page cannot move the system keyboard, so the keyboard leaves on its own at the lift instead of following the drag. Drags that start in the composer never dismiss it, and dismissing moves focus nowhere. Drag-to-dismiss has no caller control. Typing with a keyboard is unchanged.

@vjeux
