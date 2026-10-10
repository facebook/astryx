---
'@astryxdesign/core': patch
---

[fix] A field, a button or a link that a DropdownMenu, ContextMenu or sub-menu hosts beside its rows keeps its own press: a finger on a hosted field focuses it, and a hosted button's click acts. The press model used to track those presses like a row's, cancel a finger's `pointerdown` and swallow the click, so a form inside a menu went dead. Presses on rows, and on controls inside rows, keep the press model.

@vjeux
