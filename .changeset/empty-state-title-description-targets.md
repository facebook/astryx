---
'@astryxdesign/core': patch
---

[feat] EmptyState: add `empty-state-title` and `empty-state-description` theme targets on the title heading and the description. A theme can now restyle the title and description directly (e.g. font size, color, per `variant`) instead of reaching them through structural `> div:has(> :is(h1..h6))` selectors that reverse-engineer which element is which.

@freddymeta
