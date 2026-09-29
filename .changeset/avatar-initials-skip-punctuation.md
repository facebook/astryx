---
'@astryxdesign/core': patch
---

[fix] Avatar initials skip punctuation: each word's initial is its first letter, digit or emoji, so `Northwind Workbench (automation)` renders `NA` instead of `N(` and `“Ada” Lovelace` renders `AL` instead of `“L`. Words with none of those, such as a lone `-`, are ignored, and a name made only of punctuation shows the default icon rather than a stray symbol.

@light-merlin-dark
