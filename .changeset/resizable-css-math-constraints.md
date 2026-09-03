---
'@astryxdesign/core': patch
---

[feat] useResizable: compose minSize and maxSize with CSS min()/max()

`minSize` and `maxSize` now accept recursive CSS `min()` and `max()` expressions over pixel and percentage leaves, including `max(40%, 333px)` and `min(400px, 10%)`. Percentage leaves follow the configured basis at any nesting depth. Other CSS functions, arithmetic, variables, and units remain invalid; malformed values keep the existing deterministic fallbacks and development warnings. If resolved bounds conflict, the maximum wins.

The new `ResizableConstraintValue` type documents this Resizable-only input without widening shared `SizeValue`. Released `defaultSize` typing and behavior, and the deprecated `minSizePx` / `maxSizePx` aliases, remain compatible.

@freddymeta
