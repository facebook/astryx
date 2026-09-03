---
'@astryxdesign/core': patch
---

[feat] useResizable: compose defaultSize, minSize, and maxSize with CSS min()/max()

`defaultSize`, `minSize`, and `maxSize` now accept recursive CSS `min()` and `max()` expressions over pixel and percentage leaves, including `max(40%, 333px)` and `min(400px, 10%)`. A composed `defaultSize` resolves once against the initial measurable basis and becomes a pixel choice; composed bounds continue following percentage leaves and re-clamp that choice when their basis changes.

Other CSS functions, arithmetic, variables, and units remain invalid. Malformed values keep the existing role-specific deterministic fallbacks and development warnings. If resolved bounds conflict, the maximum still wins.

The Resizable-specific `ResizableConstraintValue` narrows the new bound props without widening shared `SizeValue`. Released `defaultSize: number | string` typing, pixel-only `resize()`, and deprecated `minSizePx` / `maxSizePx` aliases remain compatible; runtime validation is authoritative for default strings.

@freddymeta
