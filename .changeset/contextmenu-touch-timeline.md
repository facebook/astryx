---
'@astryxdesign/core': patch
---

[feat] ContextMenu opens from a held finger on iOS 26's timeline on iPhone and iPad (WebKit on iOS under a finger). The trigger starts to grow at 150 ms, following UIKit's measured press curve on the compositor. At 400 ms the press takes the finger: its lift no longer sends a click, and the page cannot scroll under it. The menu opens at 735 ms if the finger is still down, or as soon as it lifts after 400 ms. A finger that lifts before 400 ms, or drifts more than 11.5 px on either axis before the menu opens, gets no menu, and the trigger springs back. The page stays still while the menu is up, and the trigger returns to its size when the menu closes. Every other finger, Android included, keeps today's long press: the menu at 500 ms under the finger, with no growth and no haptic, now on the same recognizer, so its lift sends no click either, a second finger cancels it, and Android's own long-press menu no longer opens a second menu.

@vjeux
