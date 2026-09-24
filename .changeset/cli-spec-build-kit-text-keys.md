---
'@astryxdesign/cli': patch
---

[fix] `astryx build "<idea>"` no longer prints a `setup:` line in its text output. That field existed only in the text, never in the `--json` kit, so the two views disagreed. The same guidance is in the no-query `astryx build` playbook.

@josephfarina
