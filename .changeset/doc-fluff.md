---
'@astryxdesign/cli': patch
---

[feat] `doctor integration docs` (and so `integration check`) lists fluff in a package's prose, in the new `fluff` field: each padding phrase such as "in order to", "note that", or "it is worth noting", with its file line and what to write instead, and each topic of 80 or more prose words in which fewer than half the words carry content. Each is also a `doc_fluff` warning, so `integration check --strict` (new in this release) fails until it is cut; `doctor integration docs` still exits 0. The phrase list and the floor are in `astryx docs check-your-docs`. Core's `browser-support` guide loses its one padding phrase.
@josephfarina
