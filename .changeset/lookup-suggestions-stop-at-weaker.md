---
'@astryxdesign/cli': patch
---

[fix] When `astryx component`, `astryx template` or `astryx docs` names nothing, the suggestions now stop where the matches get weaker, so a strong first suggestion is no longer followed by unrelated entries. A component list keeps its first two suggestions and, after them, only suggestions about as close as the first or a close spelling of the whole typed name. A template or docs list keeps only entries that carry as many of the typed words as the closest one. A name that shares no word with any entry still gets the full list. Lists only get shorter, and every suggestion still names a real entry.

@josephfarina
