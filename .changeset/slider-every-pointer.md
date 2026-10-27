---
'@astryxdesign/core': patch
---

[feat] Slider: a mouse drag on a thumb now tracks as a finger's does. It begins after the same 10 px threshold and then follows the pointer's travel over the track's length, so the thumb never jumps to the pointer. The slider's gestures now attach for every pointer, with one listener on each thumb and on the track until a press. The 48 px touch targets stay touch-only, and a mouse press on the track still sets the value where it lands. Only a primary click presses: a right click or a macOS ctrl-click on the track no longer moves the value. A wheel or a trackpad's scroll over the slider stays the page's, as over a range input.
@vjeux
