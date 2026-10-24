---
'@astryxdesign/core': patch
---

[feat] On a touch screen, Spinner draws the iOS activity indicator in place of the ring: eight capsule spokes and a bright head that steps clockwise one spoke every 100 ms, a turn every 0.8 s, with a fading trail, as UIKit's `UIActivityIndicatorView` does. Each spoke steps its opacity on the compositor, so the indicator keeps turning while a script runs. It keeps the size's box and the shade's color (`--spinner-color`), starts its own cycle when it mounts, and keeps its pace under reduced motion, as on iOS. With a mouse or trackpad the ring is unchanged.

@vjeux
