---
'@astryxdesign/cli': patch
---

[chore] The CLI's theme build tests rebuild Core when its build is older than Core's sources or translations, so a reused checkout no longer tests the CLI against an old Core build; a test waiting on another's rebuild reads it only once that build is finished.

@vjeux
