---
'@astryxdesign/cli': patch
---

[fix] `astryx theme build` and `astryx doctor` load Core's root entry, which brings all of Core, only when a theme module imports `@astryxdesign/core`; a theme that imports only `@astryxdesign/core/theme`, or nothing from Core, no longer waits for it.

@vjeux
