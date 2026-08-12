---
'@astryxdesign/core': patch
---

[fix] ProgressBar: make the target mark's `width`/`height` themeable via `defineTheme` (`components: { 'progressbar-mark': { base: { height: '12px' } } }`). The mark size is now backed by internal vars, so a theme override reliably wins regardless of the app's CSS layer order — previously a bare `.astryx-progressbar-mark { height }` rule only tied the built-in style's specificity and could be ignored.

@freddymeta
