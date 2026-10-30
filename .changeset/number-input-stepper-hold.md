---
'@astryxdesign/core': patch
---

[feat] NumberInput: a number stepper held down keeps stepping, under a finger, a pen or a mouse, on iOS and Android alike: once after half a second, as a native iOS stepper does, then on one steady ramp that starts at a quarter of a second and quickens by a tenth each step, down to a twentieth of a second. A tap steps exactly once, on the click the browser sends when it lifts. While a press steps, the field shows each value, and `onChange` is called once, with the final value, when the press ends; a controlled field then shows whatever value its parent passes back. Sliding onto the other stepper carries the repeat to it; sliding away pauses it, and coming back resumes it, never with a step at once. The pressed stepper lights at once and clears at once. A held finger selects no text and opens no callout: in iOS Safari, resting a finger on a stepper used to select the field's label and open the edit menu over the field. A scroll that starts on a stepper still scrolls and steps nothing, and keyboard and assistive-technology activation are unchanged.

@vjeux
