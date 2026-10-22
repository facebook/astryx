---
'@astryxdesign/theme-butter': patch
'@astryxdesign/theme-stone': patch
'@astryxdesign/theme-y2k': patch
'@astryxdesign/cli': patch
---

[fix] The butter, stone, and y2k themes keep the secondary hover fill off a disabled `ComplexSelector` trigger whether the trigger is natively disabled or exposes `aria-disabled="true"`, the focusable disabled form `spec:AST-085` gives every control (FR6: no hover affordance on a disabled control). Before, the guard only recognized a natively disabled trigger. The themes `astryx theme eject` copies carry the same guard.

@cixzhang
