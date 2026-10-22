---
'@astryxdesign/cli': patch
---

[fix] `astryx upgrade --from` a version before 0.7.0 no longer fails on fallback-less `var(--color-data-*)` uses. Apps that load `@astryxdesign/core/astryx.css` are left unchanged, because that stylesheet defines all 56 data-color defaults; so are apps with no sign of a Core source build. Where Core compiles from source with `@astryxdesign/build` and nothing in the project loads `astryx.css`, the first such use in each writable file gets one TODO comment, since the defaults exist only when a compiled `dataVars` import retains them. Protected and generated files are skipped. Stale generated theme CSS that still emits the defaults at `:root` still fails the upgrade.

@ejhammond
