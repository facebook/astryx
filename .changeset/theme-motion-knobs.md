---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] A theme's `motion` takes three knobs beside the duration scale: `tempo` (0.75–1.5) scales every motion duration, `character` (`'crisp'`, `'standard'` or `'expressive'`) sets the new `--ease-entrance` and `--ease-move` tokens, and `reducedMotion: 'system'`, the only value, follows each person's Reduce Motion setting. A theme without them renders exactly as before; a duration scale and explicit tokens win over the knobs, Spinner's and Skeleton's loops keep their timing under every tempo, and the press release fade follows tempo up to the 200 ms Reduce Motion cap under the person's setting. Springs don't read the knobs yet. The motion, token and theme-authoring docs and the theme template describe the knobs.

@vjeux
