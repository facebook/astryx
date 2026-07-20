---
'@astryxdesign/core': patch
---

[chore] Migrate the duplicated charts/lab color parsers onto the shared `@astryxdesign/core/utils/color` module: adds `toGLFloats(rgba)` for RGBA→GL float conversion with a neutral non-NaN fallback, replacing the four `hexToGL` copies, and rebuilds `lerpHex`/`hexAlpha` on `parseHex`/`formatHex`/`parseColor`/`formatColor` (#3739)
@jiunshinn
