---
'@astryxdesign/core': patch
---

[fix] `GridSpan` keeps its content inside the span. A child whose min-content width is wider than the span, such as a `Tokenizer` with a long token, used to stretch the span's column past the grid cell; it now gets the span's width and truncates the way it does outside a Grid (#7438)

@WeAreResilience
