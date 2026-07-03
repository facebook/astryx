---
'@astryxdesign/core': patch
---

[fix] DateRangeInput: the preset sidebar is now a labeled `role="group"` of action buttons instead of a `role="listbox"` of `role="option"` buttons. The listbox/option roles announced a single-tab-stop listbox that contradicted the actual Tab-between-buttons interaction (no listbox keyboard model existed). The currently-applied preset is marked with `aria-current` rather than `aria-selected` (#3343).
@cixzhang
