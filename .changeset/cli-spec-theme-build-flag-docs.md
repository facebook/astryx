---
'@astryxdesign/cli': patch
---

[fix] `astryx theme build --help` and the capability manifest now state each flag's default and which flag combinations are refused (`--family` with `--out` or `--watch`, `--check` with `--watch`, `--watch` with `--json`, `--out` with more than one file), with the error code the refusal returns. (#6546)

@josephfarina
