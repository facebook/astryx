---
'@astryxdesign/core': patch
---

[fix] ComplexSelector: a trigger click reopens the popup right after Escape, an outside click, a row pick or a programmatic close. The light-dismiss guard now keys on the pointer sequence that produced the dismiss instead of a 50ms window after any hide.

@cixzhang
