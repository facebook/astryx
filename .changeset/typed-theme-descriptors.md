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

[feature] Author integration themes with typed same-stem descriptors. (#6315)

Replace the canary-only central theme catalog with `ThemeDoc` beside every theme source. Theme discovery and materialization keep each complete descriptor-owned directory together without executing source. New component, topic, and template scaffolds also emit type-annotated `.doc.mjs`; released `.template.*` inputs remain readable.

@josephfarina
