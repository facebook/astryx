---
'@astryxdesign/cli': patch
---

[fix] `astryx <command> --help` now ends with the command's documented exit codes, and each command in `astryx manifest --json` carries them as `exitCodes: [{code, when}]`.

@josephfarina
