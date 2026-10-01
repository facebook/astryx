---
'@astryxdesign/cli': patch
---

[fix] `astryx doctor` text output now uses the same field names as `--json`: each check prints its `id` and `label` (the label was shown as `check`, and the id was missing), and the summary prints `pass`, `warn`, `fail`, and `info` under a `summary` heading instead of a prose line. (#6516)

@josephfarina
