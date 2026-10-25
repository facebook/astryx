---
'@astryxdesign/core': patch
---

[feat] SegmentedControl: under a finger (any touch screen) the control tracks the touch the way UISegmentedControl does. Holding the selected segment lifts it, casting the theme's high elevation shadow; dragging carries the selection along with the finger, and the segment nearest the finger is chosen when it lets go (`onChange` fires once, at the lift). A tap on another segment dims its label while the finger is down, then slides the selection there, lifted for the first part of the way; while the lifted selection is dragged, the selected label follows the finger. A vertical drag that starts on the control still scrolls the page, and inside a scrolling page the press waits UIScrollView's content-touch delay. A commit the item's `onClick` vetoes sends the selection back at once; one a controlled parent adopts later lands without a bounce. With Reduce Motion nothing lifts, chases or travels: at the lift the selection cross-fades, and the pressed label dims on the same 200 ms fade (`design:reduced-motion`). Mouse, keyboard and assistive technology keep the click; no element is added (the lifted shadow is the control's own pseudo-element).
@vjeux
