---
'@astryxdesign/cli': patch
---

[feat] `astryx upgrade` renames a static `edgeCompensation="inline"` on `List` to `edge="outset"`, and drops `edgeCompensation` beside an `edge` that is a fixed string. It leaves a `TODO(astryx upgrade)` comment where `edge` is computed (it may be undefined, and then `edgeCompensation` still applies), on a dynamic `edgeCompensation` value, and on a spread beside it, where it cannot tell what the props carry; the deprecated prop keeps working there.

@kentonquatman
