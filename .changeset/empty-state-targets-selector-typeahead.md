---
'@astryxdesign/core': patch
---

[feat] Selector, MultiSelector and Typeahead expose their empty ("No results found") state as a themeable target (#4756, #4862) — `astryx-selector-empty-state`, `astryx-multi-selector-empty-state` and `astryx-typeahead-empty-state`. Themes can restyle the empty state without the fragile structural selectors consumers previously had to reach for. (The Selector search field is a TextInput, so its placeholder is reachable today via `.astryx-text-input::placeholder`; a Selector-scoped placeholder seam would require a TextInput change and is left as a possible follow-up.)

@freddymeta
