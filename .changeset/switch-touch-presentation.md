---
'@astryxdesign/core': patch
---

[feat] On a touch screen, Switch behaves like the iOS switch. A press lifts the thumb into a glass lens; a horizontal drag moves the thumb with the finger and flips the switch once the finger has travelled most of the track; lifting the finger commits, and a tap or a hold toggles. A vertical drag that starts on a switch scrolls the page, as before. The motion runs on the compositor, so it stays smooth while scripts run, and the switch never makes the page's scrolling wait for script. Mouse, keyboard and assistive technology behave as before.

@vjeux
