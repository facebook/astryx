---
'@astryxdesign/core': patch
---

[fix] `<Heading type="display-N">` now sizes correctly under every theme, matching `Text`'s behavior. `generateTypeScaleComponents()` only emitted `level:N`-keyed CSS rules for `heading`, with no `type:display-N` counterpart — so as soon as a theme supplied `typography.scale`, the generated theme-layer CSS's `level:N` rule was the only one present and silently won regardless of `type`, discarding the prop. A theme with no typography config was unaffected, which made the bug look intermittent.

@HelloOjasMutreja
