---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] On an iPhone or iPad (a touch screen in WebKit on iOS or iPadOS), Spinner draws the iOS activity indicator in place of the ring: eight capsule spokes and a bright head that steps clockwise one spoke every 100 ms, a turn every 0.8 s, with a fading trail, as UIKit's `UIActivityIndicatorView` does. Each spoke steps its opacity on the compositor, so the indicator keeps turning while a script runs. It keeps the size's box and the shade's color (`--spinner-color`), starts its own cycle when it mounts, and keeps its pace under reduced motion, as on iOS. The cycle is the `progress.activityIndicator.cycleMs` motion role, which a theme may retune, and `astryx docs motion` lists it. Android, other touch screens, and a mouse or trackpad keep the ring.

@vjeux
