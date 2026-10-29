---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] A theme's `motion` takes three knobs beside the duration scale: `tempo` (0.75–1.5) scales every motion duration, `character` (`'crisp'`, `'standard'` or `'expressive'`) sets the new `--ease-entrance` and `--ease-move` tokens, and `reducedMotion: 'always'` reduces motion for everyone; so far the theme's motion-keyed adaptation rules and the press release fade follow it, not yet components' other Reduce Motion styles. A theme without them renders exactly as before; a duration scale and explicit tokens win over the knobs, Spinner's and Skeleton's loops keep their timing under every tempo, and the press release fade follows tempo up to the 200 ms Reduce Motion cap, under the person's setting or the theme's `'always'`. Springs don't read the knobs yet. The motion, token and theme-authoring docs and the theme template describe the knobs.

@vjeux
