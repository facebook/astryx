---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[perf] A component carries only its own English strings. The shipped English catalog is now emitted one namespace at a time, and every core component renders with its own slice instead of the whole 408-key catalog, so an app that renders components without mounting `InternationalizationProvider` or calling `useTranslator()` bundles only the strings of the components it renders: two rows of buttons and links drop about 5 KB (gzip) from their first load. An app that does mount the provider still carries the whole catalog, now assembled from the same slices so no string ships twice; it moves by under 1 KB either way (a few slice modules cost a little, many save a little). `useTranslator()` and `InternationalizationContext` are unchanged and still resolve every `@astryx.*` key; an `InternationalizationProvider`'s `messages` and `overrides` still win over the slice; the slices themselves are not importable. One undocumented path moves: a value handed straight to `InternationalizationContext` without the provider no longer reaches core components or `useLocale`, `useDirection` and `useCollator`, which read the provider's runtime context; mount `InternationalizationProvider`.

@vjeux
