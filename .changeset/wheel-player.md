---
'@astryxdesign/core': patch
---

[chore] Internal: a player for the touch picker wheel bakes each motion into per-row Web Animations that run on the compositor, reads the offset on screen at any instant, stops a motion where it is, ticks as rows reach the band, and lands a wheel without travel for reduced motion (an opacity-only cross-fade). Nothing public changes: it is not exported from the package entry point.

@vjeux
