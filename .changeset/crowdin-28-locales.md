---
'@astryxdesign/core': patch
---

[feat] Astryx ships translations for 28 more locales. `packages/core/locales/` went from `en` and `fr-FR` to 30 files — Arabic, Catalan, Chinese (Simplified and Traditional), Czech, Danish, Dutch, Finnish, German, Greek, Hebrew, Hungarian, Italian, Japanese, Korean, Norwegian, Polish, Portuguese (Brazil and Portugal), Romanian, Russian, Serbian, Spanish, Swedish, Turkish, Ukrainian, Vietnamese and Afrikaans — covering every `@astryx.*` message the components announce or display (#5185).

Nothing changes unless you ask for it: `InternationalizationProvider` still defaults to English, and the catalogs are loaded through the existing `./locales/*.json` export. An app that already passes a `locale` now gets translated component strings where it previously fell back to English.

The catalogs come from Crowdin and are refreshed nightly (#5186), so a translation landing upstream reaches a release without anyone opening a PR by hand.

@cixzhang
