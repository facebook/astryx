---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] On Android (Chrome), ChatLayout's composer rides the keyboard in step with Gboard's slide, and Chrome no longer pans the page to reveal it. While the composer has focus, the page overlays the keyboard (`navigator.virtualKeyboard.overlaysContent`), reads the keyboard's height when the slide starts, and moves the dock on Android's keyboard curve. The curve and its durations are new theme motion roles (`androidKeyboard.showMs`, `androidKeyboard.hideMs`, `androidKeyboard.curve`), listed by `astryx docs motion`. The flag is set only while the composer has focus, and a page that sets it itself keeps its own setting.

@vjeux
