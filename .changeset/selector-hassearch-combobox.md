---
'@astryxdesign/core': patch
---

[fix] Selector/MultiSelector (`hasSearch`): the popup's search input is now the combobox — it carries `role="combobox"`, `aria-expanded`, `aria-autocomplete="list"`, `aria-controls`, and `aria-activedescendant`, so screen readers announce the highlighted option as ArrowUp/Down move it. Previously the search input was a bare `searchbox` while `aria-activedescendant` stayed on the (now-unfocused) trigger, leaving highlight changes silent. In `hasSearch` mode the trigger is a plain button that opens the listbox rather than a second combobox (#3343).
@cixzhang
