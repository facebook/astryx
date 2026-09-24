---
'@astryxdesign/cli': patch
---

[fix] The published `UpgradeListEntry` type now declares `optional`, the boolean every `astryx upgrade --list --json` entry already carries, so typed callers can read it without a cast.

@josephfarina
