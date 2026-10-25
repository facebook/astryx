---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[chore] Internal: UISwitch's values measured on iOS 26.2 (its geometry, the springs of the thumb's lift, settle, travel and drag, the track colour, and its flip distance) join the UIKit constants table, with the rule a switch's drag follows as a pure function: the finger flips the switch once it has travelled the track width minus the thumb width from where it landed, coming back past that point flips it back, and lifting the finger commits the side shown, or toggles when nothing flipped. Its springs and its minimum lift time are motion roles a theme can retune (`switchControl.lift`, `settle`, `travel`, `tracking`, `wellOn`, `wellOff` and `minimumLiftMs`), listed in the role table of `astryx docs motion`. Not exported from the package entry point; no component uses it yet.

@vjeux
