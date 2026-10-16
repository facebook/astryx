---
'@astryxdesign/core': patch
---

[fix] `AspectRatio`'s `fit="cover"` and `fit="contain"` now fill the box on the documented Tailwind setups. The fit rules lived in `reset.css`, in the `reset` layer, and the setup guides put Tailwind's preflight in a layer above it, so preflight's `img, video { height: auto }` won and a fitted image kept its own aspect ratio. The fit sizing now ships with the component's own styles in `astryx-base`: above preflight, and below Tailwind's utilities, so a utility class on the child still wins. `reset.css` no longer carries AspectRatio rules.

@vjeux
