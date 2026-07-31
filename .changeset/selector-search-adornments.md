---
'@astryxdesign/core': patch
---

[feat] Selector & MultiSelector: add `searchStartContent` / `searchEndContent` slots for decorative adornments beside the dropdown search input (only in `hasSearch` mode) — e.g. a leading search/magnifier `Icon`. The slots are rendered `aria-hidden` beside the input, so the input keeps its combobox role, focus, and keyboard behavior; they are not wired to the search query. Non-breaking.
@freddymeta
