---
'@astryxdesign/core': patch
---

[feat] Selector and MultiSelector: expose the empty ("No results found") state as a themeable target (`astryx-selector-empty-state` / `astryx-multi-selector-empty-state`). Lets themes restyle the empty state without structural CSS selectors — consumers previously had to reach it via fragile structural selectors because no stable target existed. (The search field is a TextInput, so its placeholder is reachable today via `.astryx-text-input::placeholder`; a Selector-scoped placeholder seam would require a TextInput change and is left as a possible follow-up.)

@freddymeta
