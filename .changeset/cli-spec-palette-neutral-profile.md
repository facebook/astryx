---
'@astryxdesign/cli': patch
---

[fix] `astryx theme palette generate` and `generateTonalPalette()` now reject a `neutralProfile` the recipe does not define, even when the request has no neutral family. Before, such a request produced a candidate whose receipt recorded the unknown profile as part of the normalized request. (#6534)

@josephfarina
