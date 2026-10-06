---
'@astryxdesign/build': patch
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
'@astryxdesign/theme-butter': patch
'@astryxdesign/theme-chocolate': patch
'@astryxdesign/theme-gothic': patch
'@astryxdesign/theme-matcha': patch
'@astryxdesign/theme-neutral': patch
'@astryxdesign/theme-stone': patch
'@astryxdesign/theme-y2k': patch
---

[fix] Load the canonical data-color defaults from Core instead of repeating them in every built or runtime-generated theme.

`@astryxdesign/core/astryx.css` declares every `--color-data-*` default once in `@layer astryx-base`; apps that compile Core from source receive the same declarations through Core's module graph. `@astryxdesign/build` preserves native `light-dark()` values in that source output so explicit and nested color modes resolve them the same way as the prebuilt stylesheet. Theme CSS keeps its `reset` and `astryx-theme` output and still emits authored data-color overrides, while nested themes continue to inherit values they do not override.

Theme CSS loaded without Core no longer supplies the generic defaults. Keep `@astryxdesign/cli` and `@astryxdesign/core` on the same released version when building themes; older Core stylesheets do not contain this new owner block.

@ejhammond
