---
'@astryxdesign/core': patch
---

[feat] NumberInput: under a finger, on iOS and Android alike, the number steppers sit beside the field as one control shaped like the iOS stepper: a 94 px wide capsule at the field's size (28, 32 or 36 px tall) with − at the start and + at the end, mirrored in right-to-left layouts, a divider between them, and the theme's neutral fill and icon colours. The pressed half darkens at once, and a finger can slide across the divider. Each half is its own touch target, 47 px wide and as tall as the control. The field gives up the control's width and a gap, so an attached status still lines up with the input; a field narrower than 170 px keeps the steppers inside it. With a mouse, and inside an InputGroup, the steppers stay in the field as before.

@vjeux
