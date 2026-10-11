---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[chore] The i18n runtime can hand a component its own English strings. The English catalog is also emitted one namespace at a time, the resolver takes its English fallback per call, and an internal `useComponentTranslator(slice)` lets a core component render with its own slice; the components themselves move to it in a follow-up, so nothing changes for an app yet. `useTranslator()` and `InternationalizationContext` are unchanged and still resolve every `@astryx.*` key; an `InternationalizationProvider`'s `messages` and `overrides` still win; the slices themselves are not importable. One undocumented path moves: a value handed straight to `InternationalizationContext` without the provider no longer reaches `useLocale`, `useDirection` and `useCollator`, which read the provider's runtime context; mount `InternationalizationProvider`.

@vjeux
