---
'@astryxdesign/core': patch
---

[feat] Selector & MultiSelector: add theme targets for the dropdown internals so themes can restyle them without fragile structural CSS. New targets: `selector-dropdown` / `multi-selector-dropdown` (the dropdown popover content wrapper), `selector-search` / `selector-search-input` (and the multi-selector equivalents) for the dropdown search field, `selector-empty` / `multi-selector-empty` for the "no results" state, and `selector-section-header` / `multi-selector-section-header` for grouped-option titles. Purely additive — default appearance is unchanged.
@freddymeta
