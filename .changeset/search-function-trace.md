---
'@astryxdesign/cli': patch
---

[fix] Hosts that bundle the CLI into a server function no longer pack their whole project folder into it: one path in `integration check`'s import checks was built in a way file tracers cannot follow. The path and its results are unchanged.

@josephfarina
