---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] Themes can retune UISwitch's touch motion: seven motion roles, `switchControl.lift`, `settle`, `travel`, `tracking`, `wellOn`, `wellOff` and `minimumLiftMs`, which `defineTheme({motion})` accepts and `astryx docs motion` lists. They default to UISwitch's values measured on iOS 26.2 (the thumb's lift, settle, travel and drag springs, the track colour's springs and the 235 ms minimum lift), which join the UIKit constants table with its geometry, its flip distance and the rule a switch's drag follows: the finger flips the switch once it has travelled the track width minus the thumb width from where it landed, coming back past that point flips it back, and lifting the finger commits the side shown, or toggles when nothing flipped. Switch's touch presentation plays them.

@vjeux
