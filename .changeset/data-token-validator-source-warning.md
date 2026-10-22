---
'@astryxdesign/cli': patch
---

[fix] `astryx upgrade --from` a version before 0.7.0 no longer fails on fallback-less `var(--color-data-*)` uses in apps that load `@astryxdesign/core/astryx.css`, because that stylesheet defines all 56 data-color defaults. Apps with no sign of a Core source build pass too. Where Core compiles from source with `@astryxdesign/build` and nothing in the repository loads `astryx.css`, such a use still fails the upgrade, now with a message that says why: the defaults exist only when a compiled `dataVars` import retains them. Stale generated theme CSS that still emits the defaults at `:root` still fails the upgrade.

@ejhammond
