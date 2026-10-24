---
'@astryxdesign/core': patch
---

[fix] Under a finger, the press over a checkbox box or a radio circle now fades out on the compositor, so the release keeps moving while JavaScript runs. A standalone CheckboxInput releases like a button (250 ms ease-in-out). A box in a CheckboxList row and a circle in a RadioList row release with their row (200 ms). Inside rows that paint their press on a compositor layer, the box and the circle paint their own press again, and a RadioList row stays bare, as under a mouse. Mouse presses, hover and pressed colors are unchanged.

@vjeux
