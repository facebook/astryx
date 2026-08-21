---
'@astryxdesign/core': patch
---

[fix] `useTheme` now returns a stable `token` resolver and a stable return object when the resolved theme and effective mode haven't changed. Previously both were recreated on every render, which defeated memoization in consumers like `useChartColors` (it memoizes its palette from `token`, so the changing resolver rebuilt the full color API after every unrelated rerender, and any effect depending on it reran unnecessarily).

@nynexman4464

@HelloOjasMutreja
