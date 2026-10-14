---
'@astryxdesign/core': patch
---

[fix] `NumberInput`: the screen-reader "Invalid number" alert now goes through the i18n translator, so an `InternationalizationProvider` locale or override can replace it. Adds `@astryx.numberInput.invalidNumber` to the `en` catalog. Locales without a translation yet still fall back to English.

@harjothkhara
