---
'@astryxdesign/core': patch
---

[chore] Internal: the picker wheel takes an owner's rest rule and turns from script, for the time and date-time columns that use them. Under a finger, `resolveRest` names the row a wheel moves on to after resting on another (by default the nearest enabled row), and `spinTo` on the wheel's ref turns it onto a row on the tap spin, or a duration and curve its owner passes, then commits it as a rest would; under a fine pointer `spinTo` commits the row at once. A rest on the committed row still commits nothing. Nothing public changes: the wheel is not exported from the package entry point.

@vjeux
