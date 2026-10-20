---
'@astryxdesign/cli': patch
---

[feat] `astryx upgrade` renames a static `edgeCompensation="inline"` on `List` to `edge="outset"`, and drops `edgeCompensation` beside an `edge` that is a fixed string. It keeps `edgeCompensation` with a `TODO(astryx upgrade)` comment where it can't prove the result: where `edge` is computed (it may be undefined, and then `edgeCompensation` still applies), on a dynamic `edgeCompensation` value, and where the `List` also spreads props, which may set `edge`. The deprecated prop keeps working there.

@kentonquatman
