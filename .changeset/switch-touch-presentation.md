---
'@astryxdesign/core': patch
---

[feat] Under a finger, on every touch screen, Switch moves like the iOS switch. A horizontal drag moves the thumb with the finger and flips the switch once the finger has travelled most of the track; lifting the finger commits, and a tap or a hold toggles. A finger that starts moving vertically at once scrolls the page; a finger that rests on the switch first keeps it, as in a UIKit list, so a scroll that starts on the switch waits for a busy main thread. The motion runs on the compositor, so it stays smooth while scripts run. Under a finger the track keeps its theme's fill, and the colour change crossfades over it. With reduced motion on, a change cross-fades instead of moving on a touch screen and is immediate with a mouse. A press shows the pressed overlay, and a still hold selects no text. Mouse, keyboard and assistive technology behave as before.

@vjeux
