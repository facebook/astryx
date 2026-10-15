---
'@astryxdesign/core': patch
---

[fix] `FormLayout`: below the 480px collapse, `direction="horizontal-labels"` controls now fill the column the way they do in a vertical `FormLayout`. Previously each control shrank to its content, so a `Selector` was only as wide as its current value. The two-column layout above 480px is unchanged.

@harjothkhara
