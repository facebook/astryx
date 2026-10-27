---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] A theme's `motion` takes three knobs beside the duration scale: `tempo` (0.75–1.5) scales every motion duration, `character` (`'crisp'`, `'standard'` or `'expressive'`) sets the new `--ease-entrance` and `--ease-move` tokens, and `reducedMotion: 'always'` marks the theme's root so motion is reduced for everyone. A theme without them renders exactly as before; a duration scale and explicit tokens win over the knobs, and Spinner's and Skeleton's loops keep their timing under every tempo. The motion, token and theme-authoring docs and the theme template describe the knobs.

@vjeux
