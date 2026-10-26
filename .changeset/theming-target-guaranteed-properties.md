---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] A component's theming target can now list `guaranteedProperties`: the CSS properties a theme sets on that target with a guaranteed result (any other property is best effort). `astryx component <Name>` prints them under the targets table. Switch's `switch-thumb` target guarantees `aspectRatio`: under a touch presentation it sets the thumb's width from its height, so `1` draws a circle.

@cixzhang
