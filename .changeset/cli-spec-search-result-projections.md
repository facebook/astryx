---
'@astryxdesign/cli': patch
---

[fix] `astryx search` text output now prints every field its `--json` results carry: `title` for doc results and `kind` for template results were missing. The `--verbose` help now says what it adds: each result's score and match reason. (#6527)

@josephfarina
