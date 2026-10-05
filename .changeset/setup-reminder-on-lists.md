---
'@astryxdesign/cli': patch
---

[fix] The "Next step: run `astryx init`" reminder no longer prints on every command.

In a project that has not run `astryx init`, it now shows only on the reads that list what exists, run without a subject: `docs`, `component --list`, `template --list`, `hook`, `discover`, and `build` with no query. Reads and writes of one thing, such as `docs tokens` or `component Button`, stay quiet. `astryx doctor` still reports the missing agent docs with the fix, and installing still reminds once.

@josephfarina
