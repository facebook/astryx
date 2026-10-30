---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] `createAnimator` and its hook `useAnimator` animate one element with the motion Astryx's components use. `animate` springs `x`, `y`, `scale`, `rotate` and `opacity` to a target on the theme's state-change motion, at its tempo and character, `decay` coasts any of them from a release velocity, `set` jumps, `get` and `getVelocity` read, and `stop` halts; `animate` and `decay` return a promise. Reduce Motion is planned for every call. `createAnimator` is exported from the package root and `useAnimator` from `@astryxdesign/core/hooks`; the CLI's templates gain a playing-cards example of each.

@vjeux
