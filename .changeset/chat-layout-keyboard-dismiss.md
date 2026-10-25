---
'@astryxdesign/core': patch
---

[feat] ChatLayout: under a finger, dragging the conversation down to the composer now dismisses the software keyboard, as in Messages. A web page cannot move the system keyboard, so the keyboard leaves on its own instead of following the finger. Touches that start in the composer never dismiss it, and a mouse is unchanged. On Android, Chrome reports no keyboard height to the page; to keep the composer above the keyboard there, add `interactive-widget=resizes-content` to the viewport meta tag.

@vjeux
