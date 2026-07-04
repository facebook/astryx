---
'@astryxdesign/core': patch
---

[feat] Standardize layout component sizing props. Add `maxWidth`/`minHeight` to `Stack`, `Grid`, and `Center` (matching `Section`/`Card`), migrate `Layout`/`LayoutHeader`/`LayoutFooter`/`LayoutPanel` sizing to the shared `SizeValue` type, and drop redundant `xstyle`/`className`/`style` re-declarations on `Stack`, `StackItem`, and `Layout`. No runtime behavior change.
@cixzhang
