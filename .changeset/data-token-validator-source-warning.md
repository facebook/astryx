---
'@astryxdesign/cli': patch
---

[fix] `astryx upgrade --from` a version before 0.7.0 no longer fails on fallback-less `var(--color-data-*)` uses. Prebuilt projects are left unchanged, because `@astryxdesign/core/astryx.css` defines all 56 data-color defaults. A project that compiles Astryx source with `@astryxdesign/build` gets one TODO comment per file at the first such use, since its defaults exist only when a compiled `dataVars` import retains them. Stale generated theme CSS that still emits the defaults at `:root` still fails the upgrade.

@ejhammond
