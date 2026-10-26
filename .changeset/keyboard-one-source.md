---
'@astryxdesign/core': patch
---

[fix] BottomSheet reads the on-screen keyboard from core's shared keyboard module. It now detects the keyboard from the browser's capabilities (a top-level document with a visual viewport, Chrome on Android included) instead of the user agent, measures the keyboard so that a page pan or a pinch zoom never reads as one and a pinch-zoomed page still reads the keyboard's full height, and lays a Tall sheet's keyboard room out through its own style rather than a CSS custom property. In Chrome on Android a Tall sheet rides Gboard's slides: its focused field rises with the keyboard, and through the keyboard's hide the room stays while the content rides down, so nothing jumps while the keyboard is still on screen. The browser-support guide documents Chrome on Android's `interactive-widget` viewport setting.

@vjeux
