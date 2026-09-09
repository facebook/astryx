---
'@astryxdesign/core': patch
---

[fix] defer clear focus restoration for pointer/touch taps to prevent page scroll jumps while preserving synchronous focus restoration on keyboard activation and properly composing `onPointerDown` in `InputClearButton`
@Geervan
