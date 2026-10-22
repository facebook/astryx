---
'@astryxdesign/cli': patch
---

[fix] `astryx search` ties its entry-index reuse to one list of the fields the index reads, so the index is never reused after any of them changes; answers are unchanged.

@josephfarina
