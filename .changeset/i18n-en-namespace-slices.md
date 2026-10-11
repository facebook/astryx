---
'@astryxdesign/core': patch
---

[perf] A component carries only its own English strings. The shipped English catalog is now emitted one namespace at a time, and every core component renders with its own slice instead of the whole 408-key catalog, so an app bundles the strings of the components it renders: two rows of buttons and links drop about 5 KB (gzip) from their first load. `useTranslator()` and `InternationalizationContext` are unchanged and still resolve every `@astryx.*` key; an `InternationalizationProvider`'s `messages` and `overrides` still win over the slice; the slices themselves are not importable. One undocumented path moves: a value handed straight to `InternationalizationContext` without the provider no longer reaches core components or `useLocale`, `useDirection` and `useCollator`, which read the provider's runtime context; mount `InternationalizationProvider`.

@vjeux
