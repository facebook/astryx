---
'@astryxdesign/core': patch
---

[fix] TreeList: focusing a parent row no longer leaks the focus-visible outline onto its descendant rows — each row's ring now resolves from its own nearest treeitem instead of matching any focused ancestor (#4130)
@is-jain
