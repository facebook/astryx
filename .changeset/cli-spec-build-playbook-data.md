---
'@astryxdesign/cli': patch
---

[fix] `astryx build --json` with no query, and `build()` with no query, now return the playbook itself — a title, the ordered steps with their commands, the on-system rules, and related lookups — instead of only `{playbook: true}`. The terminal output is rendered from the same data, and `playbook: true` is still there.

@josephfarina
