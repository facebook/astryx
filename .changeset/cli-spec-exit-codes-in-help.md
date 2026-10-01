---
'@astryxdesign/cli': patch
---

[fix] `astryx <command> --help` (including `astryx manifest --help`) now ends with the command's documented exit codes, and each command in `astryx manifest --json` carries them as `exitCodes: [{code, when}]`. `astryx doctor --help` shows them once, and the `discover` exit codes now say when they apply: a blank `discover` query exits 1 when packages are discovered. (#6586)

@josephfarina
