---
'@astryxdesign/cli': patch
---

[fix] `--json` output is one envelope again when `astryx.config` or an integration manifest prints while it loads. Anything a project module writes to stdout during its load now goes to stderr.

@josephfarina
