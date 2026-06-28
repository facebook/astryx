---
'@astryxdesign/core': patch
---

[docs] Give the `Skeleton` properties-tab example explicit dimensions so it is visible

The `Skeleton` doc had no `playground` config, so the interactive
properties-tab preview fell back to the prop defaults of `width: '100%'` /
`height: '100%'`. With no sized parent, the skeleton collapsed to a zero-size
(invisible) element. The doc now sets a `playground.defaults` of
`width: 320` / `height: 80` so the shimmer placeholder renders visibly.

@cixzhang
