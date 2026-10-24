---
'@astryxdesign/core': patch
---

[feat] SegmentedControl: under a finger the control tracks the touch the way iOS does. Holding the selected segment lifts it, dragging carries the selection along with the finger, and the segment nearest the finger is chosen when it lets go (`onChange` fires once, at the lift). A tap on another segment slides the selection there, lifted for the first part of the way. Mouse, keyboard and assistive technology keep the click.
@vjeux
