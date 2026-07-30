---
'@astryxdesign/core': patch
---

[feat] TreeList: add `endContentReveal` (`'always' | 'hover'`, default `'always'`). With `'hover'`, each row's `endContent` is hidden at rest and revealed on row hover or keyboard focus (and stays visible on touch), so secondary row actions like a delete button don't add visual noise at rest. The reveal is CSS-driven and scoped per row (so nested trees react to their own hover/focus), keeps the content mounted and focusable for accessibility, and honors `prefers-reduced-motion`.
@freddymeta
