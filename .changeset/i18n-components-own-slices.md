---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[perf] A component carries only its own English strings. Every core component now renders with its own namespace slice of the English catalog instead of the whole 408-key catalog, so an app that renders components without mounting `InternationalizationProvider`, calling `useTranslator()` or importing `InternationalizationContext` (each of which carries the whole catalog) bundles only the strings of the components it renders: two rows of buttons and links drop about 5 KB (gzip) from their first load. An app that does mount the provider still carries the whole catalog, now assembled from the same slices so no string ships twice; it moves by under 1 KB either way (a few slice modules cost a little, many save a little). `useTranslator()` is unchanged. `astryx swizzle` points an ejected component's strings at the public `useTranslator()`: the internal translator import, the slice imports and a module-level merge of slices are rewritten, so the copy compiles in the app.

@vjeux
