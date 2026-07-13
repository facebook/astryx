---
'@astryxdesign/core': patch
---

[fix] ProgressBar: treat a non-finite value/max as empty progress

A NaN `value` (e.g. an upstream `loaded / total * 100` with total 0) leaked the literal string "NaN" into `aria-valuenow`, the value label, and the fill width style. Non-finite `value`/`max` now route through the same empty-progress handling as `max={0}`.
@arham766
