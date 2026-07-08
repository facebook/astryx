---
'@astryxdesign/core': patch
---

[breaking] Table plugin render-prop interfaces (`TableRenderProps`, `HeaderRowRenderProps`, `HeaderCellRenderProps`, `BodyRowRenderProps`, `BodyCellRenderProps`, `ScrollWrapperRenderProps`) and the `scrollWrapper` component contract rename their StyleX array field `styles` → `xstyle`, matching the prop name sub-components receive it under. Custom plugin authors: rename `props.styles` reads and `styles:` writes in transform functions (#3679)
@AKnassa
