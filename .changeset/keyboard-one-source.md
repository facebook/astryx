---
'@astryxdesign/core': patch
---

[fix] BottomSheet reads the on-screen keyboard from core's shared keyboard module. It now detects the keyboard from the browser's capabilities (a top-level document with a visual viewport, and a finger where the browser has a keyboard geometry API of its own, as Chrome on Android) instead of the user agent, measures the keyboard so that a page pan or a pinch zoom never reads as one and a pinch-zoomed page still reads the keyboard's full height, and lays a Tall sheet's keyboard room out through its own style rather than a CSS custom property. The browser-support guide documents Chrome on Android's `interactive-widget` viewport setting.

@vjeux
