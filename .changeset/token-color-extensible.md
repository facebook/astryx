---
'@astryxdesign/core': patch
---

[feat] Token: make the `color` prop extensible via module augmentation. `TokenColor` is now derived from a `TokenColorMap` interface, so theme packages can add custom colors (and `astryx theme build` generates the type augmentation), matching Badge and Button.
@cixzhang
