---
'@astryxdesign/core': patch
---

[fix] `List` with `hasDividers` no longer draws a divider after the last `ListItem`. The last-item reset used the `borderBlockEnd` shorthand, which StyleX's default property-specificity mode drops silently, so it never reached the shipped CSS; it is now the `borderBlockEndWidth` longhand.

@kyu-rong
