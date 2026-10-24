---
'@astryxdesign/core': patch
---

[fix] BottomSheet reads the on-screen keyboard from core's shared keyboard module. It now detects the keyboard from the browser's capabilities (a visual viewport and no keyboard geometry API of its own) instead of the user agent, and it measures the keyboard so that a page pan or a pinch zoom never reads as one.

@vjeux
