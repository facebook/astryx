---
'@astryxdesign/core': patch
---

[feat] TopNav's phone bar under a finger (one touch model on every touch device, iOS and Android alike) takes the iOS 26 bar's geometry, and its end items sit together on one capsule. The geometry comes from the theme's spacing and size tokens: with the defaults the bar is 54px tall, with its items on the top 44px and 16px from the screen's sides, and the capsule is 44px tall and fully rounded, placing each control where UIKit centres its 36px cells. The capsule paints the theme's `--color-background-surface`, with no shadow and nothing blurred. No token is added. With a mouse the bar is unchanged.

@vjeux
