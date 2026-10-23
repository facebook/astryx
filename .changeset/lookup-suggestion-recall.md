---
'@astryxdesign/cli': patch
---

[fix] A lookup that names nothing now suggests more of the right entries: `astryx component` suggests a component whose whole name is a run of the typed name's words when no other match exists (a wrapper or prefixed name), and `astryx docs` suggests the doc a topic names in another spelling (case, separators, a plural) instead of the whole topic list.

@josephfarina
