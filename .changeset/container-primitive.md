---
'@astryxdesign/core': patch
---

[feat] Add Container layout primitive (#3492)

The canonical page wrapper: a horizontally centered column with `maxWidth` (default 1280), a fluid side gutter (`clamp()` between spacing tokens, so it tightens on small screens and stays theme-controlled), and a neutral `div` element with an `as` escape hatch for landmark tags. Fills the gap between Section (max-width but no centering, discrete padding only) and Center (centering but no max-width/gutter).
@arham766
