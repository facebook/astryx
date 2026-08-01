---
'@astryxdesign/core': patch
---

[feat] Selector & MultiSelector: the dropdown search field now has built-in affordances — a leading search magnifier icon and a trailing clear (✕) button that appears once a query is typed (clearing resets the query and refocuses the input). Themeable via `selector-search-icon` / `selector-search-clear-icon` (and the multi-selector equivalents). Non-breaking, but note the magnifier is a new default glyph, so existing `hasSearch` dropdowns gain a leading icon.
@freddymeta
