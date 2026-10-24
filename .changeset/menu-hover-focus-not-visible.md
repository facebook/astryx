---
'@astryxdesign/core': patch
---

[fix] DropdownMenu, ContextMenu: a row the mouse rests on, or a held press is dragged over, takes focus without matching `:focus-visible`. A plain focus inherited the state from the focus before it (the menu after a pointer open, a row a key reached), so any keyboard-only focus style, a theme's or an app's, painted on the row under the mouse. A key pressed afterwards moves focus with the indicator as before. Checkbox, radio and sub-menu rows, and the ContextMenu and Breadcrumbs menus built on them, follow.

@vjeux
