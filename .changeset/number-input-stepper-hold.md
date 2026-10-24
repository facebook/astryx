---
'@astryxdesign/core': patch
---

[feat] NumberInput: on a touch screen, a finger held on a number stepper keeps stepping, as a native iOS stepper does: once after half a second, then every half second, and every tenth of a second after three seconds. A tap steps once, when the finger lifts; sliding onto the other stepper carries the repeat to it, and sliding off the steppers stops it. The pressed stepper lights at once and clears at once. A scroll that starts on a stepper still scrolls and steps nothing, and a mouse click is unchanged.

@vjeux
