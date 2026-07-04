---
'@astryxdesign/core': patch
---

[feat] TabList is now a single tab stop with arrow-key navigation between tabs (roving tabindex) — Arrow keys move focus, Home/End jump to the ends, disabled tabs are skipped, and focus wraps. This does not change the semantic roles (still `<nav>`/`aria-current`); the full tablist/tab/tabpanel conversion is tracked separately in #3335. Reference (#3343).

@cixzhang
