---
'@astryxdesign/core': patch
---

[feat] PowerSearch is now translatable. UI chrome, value-editor labels + placeholders, the 21 built-in operator labels, and ICU-pluralized result counts all respond to `<InternationalizationProvider locale="...">`. Astryx's English wording is preserved for consumers without a provider.

[breaking type] `PowerSearchOperator` is now a discriminated union — either `{key, value, label}` (raw text) or `{key, value, i18nKey}` (astryx-translated). Existing consumers passing `label: '...'` compile and behave unchanged. Consumers who want translated defaults can switch to `i18nKey: '@astryx.powersearch.operator.<name>'`. A bare `{key, value}` — with neither `label` nor `i18nKey` — is now a compile-time error, preventing an easy footgun.

New exports: `PowerSearchOperatorBase`, `PowerSearchOperatorWithLabel`, `PowerSearchOperatorWithI18nKey`, `resolveOperatorLabel(op, t)` (useful for custom token renderers via `components.Token`).

@nynexman4464
