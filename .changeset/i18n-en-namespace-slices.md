---
'@astryxdesign/core': patch
---

[perf] A component carries only its own English strings. The shipped English catalog is now emitted one namespace at a time, and every core component renders with its own slice instead of the whole 408-key catalog, so an app bundles the strings of the components it renders: two rows of buttons and links drop about 5 KB (gzip) from their first load. `useTranslator()` is unchanged and still resolves every `@astryx.*` key; an `InternationalizationProvider`'s `messages` and `overrides` still win over the slice.

@vjeux
