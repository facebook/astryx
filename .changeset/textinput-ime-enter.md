---
'@astryxdesign/core': patch
---

[fix] TextInput's `onEnter` no longer fires for the Enter that commits an IME conversion (Japanese/Chinese/Korean input); `onKeyDown` still receives the raw event. (#6082)
@ManoharPaturi
