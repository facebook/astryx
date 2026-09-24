---
'@astryxdesign/cli': patch
'@astryxdesign/theme-butter': patch
'@astryxdesign/theme-chocolate': patch
'@astryxdesign/theme-gothic': patch
'@astryxdesign/theme-matcha': patch
'@astryxdesign/theme-neutral': patch
'@astryxdesign/theme-stone': patch
'@astryxdesign/theme-y2k': patch
---

[feat] Author integration themes with typed same-stem descriptors.

Replace the central integration theme catalog (`themes/manifest.json`, which 0.6.3 writes) with `ThemeDoc` beside every theme source. An integration that still ships the catalog must add a descriptor to each theme directory: its themes root is refused, and until then the package's other contributions are withheld. Theme discovery reads descriptors and checks integration theme sources without executing them, and `theme add` copies an integration theme's complete directory. New component, topic, and template scaffolds also emit type-annotated `.doc.mjs`; released `.template.*` inputs remain readable.

@josephfarina
