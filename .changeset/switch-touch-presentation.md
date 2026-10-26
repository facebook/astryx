---
'@astryxdesign/core': patch
---

[feat] Under a finger, on every touch screen, Switch moves like the iOS switch. A press lifts the thumb a little, with a soft shadow, and a horizontal drag moves it with the finger and flips the switch once the finger has travelled most of the track; lifting the finger commits. A tap toggles through the browser's own click, and a hold or a short drag toggles at the lift. The thumb stays inside the track however far the finger drags past either end, in either writing direction. A press slid off the switch and lifted outside still toggles it, as on iOS. A vertical drag scrolls the page and the switch lets go. The motion runs on the compositor, so it stays smooth while scripts run. Under a finger the thumb is a pill by default; a theme can reshape it with `aspect-ratio` on the `switch-thumb` target (`1` draws a circle), and the thumb's travel, lift and drag follow the shape it renders. The track keeps its theme's fill, and the colour change crossfades over it. With reduced motion on, a change cross-fades instead of moving on a touch screen and is immediate with a mouse. A press shows the pressed overlay, through a drag too, and a still hold selects no text. Mouse, keyboard and assistive technology behave as before. Switch is the first component built on the shared press tracking and touch negotiation.

@vjeux
