---
'@astryxdesign/core': patch
---

[chore] One press machine and one press paint. The touch press controller behind `usePressFeedback` is the only writer of `data-astryx-press`: the internal delegated press consumer and press painter of the gesture system are removed (no component used them, and no package entry point exported them), and a selection hold writes its `held` row through the controller.

@vjeux
