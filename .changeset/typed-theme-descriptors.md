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

Replace the central integration theme catalog (`themes/manifest.json`, which 0.6.3 writes) with `ThemeDoc` beside every theme source. An integration that still ships the catalog must add a descriptor to each theme directory: its themes root is refused, and until then the package's other contributions are withheld. Theme discovery reads descriptors and checks integration theme sources without executing them, and `theme add` copies an integration theme's complete directory. `astryx doctor integration validate` warns about a folder in the themes root that looks like a theme but is not read as one. New component, topic, and template scaffolds also emit type-annotated `.doc.mjs`; released `.template.*` inputs remain readable.

@josephfarina
