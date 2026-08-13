---
'@astryxdesign/core': patch
---

[fix] ProgressBar: a theme can size the target mark again without `!important`. The mark's `width`/`height` were plain StyleX declarations, so a `progressbar-mark` override only landed where `@layer astryx-theme` outranks the component atomics — in a source-build app that compiles StyleX without `useCSSLayers` the atomics are unlayered and beat every theme rule, leaving no way to resize the tick but an unlayered `!important` rule. The dimensions now travel as derived vars with no competing declaration, so the same `defineTheme` entry lands in either build. Theme authoring is unchanged; a mark's color is still a plain declaration and still depends on the layer order. (#4970)

@cixzhang
