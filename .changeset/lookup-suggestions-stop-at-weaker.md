---
'@astryxdesign/cli': patch
---

[fix] When `astryx component`, `astryx template` or `astryx docs` names nothing, the suggestions now stop where the matches get weaker, so a strong first suggestion is no longer followed by unrelated entries. A component list keeps its first two suggestions and, after them, only suggestions about as close as the first or a close spelling of the whole typed name. In a template or docs list, when the closest entry carries every typed word, only entries that carry every typed word stay; when it carries some of them, entries that carry none are left out. One-letter words do not count. A name that shares no word with any entry still gets the full list. Lists only get shorter, and every suggestion still names a real entry.

@josephfarina
