---
'@astryxdesign/cli': patch
---

[chore] The CLI's theme build tests rebuild Core when its build is older than Core's sources, so a reused checkout no longer tests the CLI against an old Core build.

@vjeux
