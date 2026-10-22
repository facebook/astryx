---
'@astryxdesign/cli': patch
---

[fix] `astryx upgrade --from` a version before 0.7.0 no longer fails on fallback-less `var(--color-data-*)` uses in apps on prebuilt `@astryxdesign/core/astryx.css`, which defines all 56 data-color defaults. Such a use fails only when the app's own build configuration (Babel, PostCSS, Next.js or Vite config) loads `@astryxdesign/build`, which compiles Core from source, and no app entry or stylesheet loads `astryx.css`. The error now names that config and explains that the defaults exist only when a compiled `dataVars` import retains them. Any setup the upgrade cannot establish passes. Stale generated theme CSS that still emits the defaults at `:root` still fails the upgrade.

@ejhammond
