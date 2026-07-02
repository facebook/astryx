---
'@astryxdesign/core': patch
---

[fix] ContextMenu and NavMenu heading menus now support first-character typeahead (type a letter to jump to the matching item), via the shared `useTypeahead` hook — matching DropdownMenu. MoreMenu inherits it through DropdownMenu (#3343).
@cixzhang
