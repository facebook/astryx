---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] In Chrome on Android, ChatLayout's composer rides the keyboard (spec:AST-099 FR8): it follows Gboard's slide up from Chrome's report, joining the slide where it is, and its slide down from the blur, instead of being covered until the keyboard settles. The keyboard is measured from Chrome's visual viewport under a finger. Under Reduce Motion the composer never travels: it cross-fades to its place on a touch screen. The slides' durations and curves are new theme motion roles (`androidKeyboard.showMs`, `androidKeyboard.showCurve`, `androidKeyboard.hideMs`, `androidKeyboard.hideCurve`), listed by `astryx docs motion`.

@vjeux
