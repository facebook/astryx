---
'@astryxdesign/cli': patch
---

[fix] `astryx component <Name>` no longer prints a "Related block templates" list that `--json` never carried, so the text output shows only what the JSON result holds. The same blocks are still listed by `astryx component <Name> --blocks`, in text and JSON.

@josephfarina
