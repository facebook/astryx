---
'@astryxdesign/core': patch
---

[fix] Spinner: the rotation animation now slows substantially under `prefers-reduced-motion: reduce` (matching ProgressBar) instead of spinning unconditionally. The `role="status"` "Loading" announcement still conveys busy state (#3343).
@cixzhang
