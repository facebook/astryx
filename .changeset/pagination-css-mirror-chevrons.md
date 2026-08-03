---
'@astryxdesign/core': patch
---

[fix] Pagination: mirror the prev/next chevrons under RTL with CSS (the shared `scaleX(-1)` mirror) instead of reading the ambient direction in JS. The controls now flip purely from an ancestor's `dir`, matching Calendar and the rest of the library — so they render correctly on the server with no hydration flash. No API change; `aria-label`s are unchanged.
@nynexman4464
