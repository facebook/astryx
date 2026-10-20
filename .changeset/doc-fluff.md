---
'@astryxdesign/cli': patch
---

[feat] `doctor integration docs` (and so `integration check`) lists fluff in a package's prose, in the new `fluff` field: each padding phrase such as "in order to", "note that", or "it is worth noting", with its file line and what to write instead, and each topic of 80 or more prose words in which fewer than half the words carry content. It is information only and never fails a check. Core's own guides lose their two padding phrases.
@josephfarina
