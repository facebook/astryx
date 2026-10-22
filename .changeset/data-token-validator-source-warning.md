---
'@astryxdesign/cli': patch
---

[fix] `astryx upgrade --from` a version before 0.7.0 no longer fails on `var(--color-data-*)` uses without a fallback. Prebuilt `@astryxdesign/core/astryx.css` defines all 56 data-color defaults, and source builds read data colors through `dataVars`, so the upgrade no longer asks for fallbacks. Stale generated theme CSS that still emits the defaults at `:root` still fails the upgrade.

@ejhammond
