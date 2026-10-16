---
'@astryxdesign/core': patch
---

[docs] The `useMultiCombobox` hook docs now say that ArrowDown or ArrowUp opening the list lands on the first or last option even with `hasSearch` or a disabled end option, and that the hook still handles Home and End with `hasSearch`, so a search input that keeps those keys for the caret stops them first and relies on PageUp and PageDown.

@cixzhang
