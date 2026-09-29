---
'@astryxdesign/cli': patch
---

[fix] `astryx layout expand` now caps every `*N` repeat at 10000 copies. Repeated table rows skipped the cap, and a huge count on any element was still walked copy by copy before the cap applied, so `B*999999999` could hang or run out of memory. `astryx layout grammar` now states the cap. (#6565)

@josephfarina
