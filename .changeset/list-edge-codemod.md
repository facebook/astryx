---
'@astryxdesign/cli': patch
---

[feat] `astryx upgrade` renames a static `edgeCompensation="inline"` on `List` to `edge="outset"`, and drops `edgeCompensation` where `edge` is already set. Dynamic values are left for manual migration; the deprecated prop keeps working.

@kentonquatman
