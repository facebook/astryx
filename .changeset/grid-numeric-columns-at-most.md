---
'@astryxdesign/core': minor
---

[breaking] `Grid columns={N}` now means "at most N columns". Each column stays at least 12rem wide, so the grid shows fewer columns in narrow containers and one full-width column on a phone instead of squeezing N slivers. A `GridSpan` inside such a grid spans the whole row once the grid has fewer columns than the span. Use `columns={{count: N, isFixed: true}}` to keep exactly N columns at every width (the previous `repeat(N, 1fr)` track list), for example a 7-day week row.

@thedjpetersen
