---
'@astryxdesign/core': patch
---

[feat] NumberInput: under a finger or a pen, on iOS and Android alike, a number stepper held down keeps stepping, as a native iOS stepper does: once after half a second, then every half second, every tenth of a second after three seconds, and every twentieth of a second from the twentieth step. A tap steps once, when the finger lifts; sliding onto the other stepper carries the repeat to it, and sliding off the steppers stops it. The pressed stepper lights at once and clears at once. A scroll that starts on a stepper still scrolls and steps nothing, and a mouse click is unchanged. A held finger selects no text: the stepper column leaves that to the gesture system's press tracking instead of styles of its own.

@vjeux
