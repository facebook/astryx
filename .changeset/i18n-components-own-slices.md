---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[perf] A component carries only its own English strings. Every core component now renders with its own namespace slice of the English catalog instead of the whole catalog, so an app that renders components without mounting `InternationalizationProvider`, calling `useTranslator()` or importing `InternationalizationContext` (each of which carries the whole catalog), and that does not render `PowerSearch` (whose caller-supplied operator keys keep the whole catalog as their fallback), bundles only the strings of the components it renders: a page importing `Button`, `Dialog`, `DateInput` or `List` loads 6.2 to 6.8 KB (gzip) less JavaScript. An app that does mount the provider still carries the whole catalog, now assembled from the same slices so no string ships twice; such a page loads 1.2 to 1.9 KB (gzip) more, because the catalog spread over its slice modules compresses worse than one module (about 0.9 KB more when the provider is imported before the components). `useTranslator()` is unchanged. `astryx swizzle` points an ejected component's strings at the public `useTranslator()`: the internal translator import, the slice imports and a module-level merge of slices are rewritten, so the copy compiles in the app.

@vjeux
