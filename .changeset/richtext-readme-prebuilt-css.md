---
'@astryxdesign/richtext': patch
---

[docs] The `@astryxdesign/richtext` README shows the full stylesheet setup: Core's `reset.css` and `astryx.css`, your theme's CSS, and `richtext.css`. It says the package ships prebuilt CSS, so you never compile its source, and that `richtext.css` sits in `@layer astryx-base`, so theme overrides win once `reset.css` (or the layer-order line) loads first.

@cixzhang
