---
'@astryxdesign/core': patch
---

[feat] In Chrome on Android, ChatLayout's composer rides Gboard's own measured slides (spec:AST-099 FR8): it follows the slide up from Chrome's report, joining the slide where it is, and the slide down from the blur, where it played the keyboard's iOS spring before. Under Reduce Motion the composer never travels: it cross-fades to its place on a touch screen.

@vjeux
