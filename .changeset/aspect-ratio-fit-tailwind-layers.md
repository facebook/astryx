---
'@astryxdesign/core': patch
---

[fix] `AspectRatio`'s `fit="cover"` and `fit="contain"` now fill the box on the documented Tailwind setups. Tailwind's preflight sets `height: auto` on every `img` and `video`, and the setup guides put preflight in a layer above `reset`, where the fit rules lived, so a fitted image kept its own aspect ratio instead of filling. The fit rules now sit in `astryx-base`, still in `reset.css`: above preflight, and below Tailwind's utilities, so a utility class on the child still wins.

@vjeux
