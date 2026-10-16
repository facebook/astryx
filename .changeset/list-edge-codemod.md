---
'@astryxdesign/cli': patch
---

[feat] `astryx upgrade` renames a static `edgeCompensation="inline"` on `List` to `edge="outset"`, and drops `edgeCompensation` where `edge` is already set. It leaves a `TODO(astryx upgrade)` comment on a dynamic `edgeCompensation` value and on a spread beside it, where it cannot tell what the props carry; the deprecated prop keeps working there.

@kentonquatman
