---
'@astryxdesign/core': patch
---

[feat] Table: `useTableTreeData` gains an opt-in `hasRowClickExpansion` prop. When set, clicking anywhere on an expandable row toggles it, in addition to the chevron. Clicks on interactive cell content or a text selection are ignored, leaf rows stay inert, and it is a no-op on flat data. (#4142)
@humbertovirtudes
