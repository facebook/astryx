---
'@astryxdesign/core': patch
---

[fix] NumberInput: the number-stepper column now tracks a themed padding instead of assuming the default. Theming `number-input` padding used to leave the steppers short of the field edges (a gap top/bottom, or detached from the inline edge); the wrapper padding is now carried through private vars the steppers cancel against, and the stepper corners follow the themed field radius.

@freddymeta
