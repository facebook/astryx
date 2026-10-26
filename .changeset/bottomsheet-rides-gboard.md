---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] In Chrome on Android, on a touch screen, a Tall BottomSheet's focused field rides the on-screen keyboard as Gboard slides it up and down: a field revealed during the show rises with the keyboard, and through the hide the sheet's scroll room stays while its content rides down, so nothing jumps while the keyboard is still on screen. Under Reduce Motion it cross-fades instead of moving. The browser-support guide says so.

@vjeux
