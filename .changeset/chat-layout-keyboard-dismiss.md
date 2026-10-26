---
'@astryxdesign/core': patch
---

[feat] ChatLayout: under a finger, dragging the conversation down to the composer and lifting it there, or flicking toward it, now dismisses the software keyboard, as in Messages, wherever ChatLayout keeps its composer on the keyboard (Safari on iOS, Firefox and Chrome for Android); a release moving back up keeps it. A web page cannot move the system keyboard, so the keyboard leaves on its own at the lift instead of following the finger. Touches that start in the composer never dismiss it, and dismissing moves focus nowhere. Drag-to-dismiss is part of ChatLayout's touch behavior, with no caller control: touch-only behavior ChatLayout's own record defines, under `architecture:public-component-api` INV16's carve-out for it. A mouse and the keyboard are unchanged.

@vjeux
