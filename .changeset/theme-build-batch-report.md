---
'@astryxdesign/cli': patch
---

[fix] `astryx theme build` prints one line per built theme, plus one line naming fonts the themes do not load. Before, every theme printed the same install example and font recipe, so a build of many themes printed the same blocks again and again. `--detail full` prints the install example and font recipe, once for a batch instead of once per theme; for one theme it prints what the default printed before. `--json` and `--check` are unchanged.

@josephfarina
