---
'@astryxdesign/cli': patch
---

[chore] Docs reads go through one internal compiler. `astryx docs` (and `docs()`), `astryx doctor` and `astryx search` read compiled topic nodes instead of each loading, merging, translating and linking doc files on its own. Output is unchanged. (#6484)

@josephfarina
