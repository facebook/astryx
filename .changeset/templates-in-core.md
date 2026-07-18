---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[chore] Move built-in templates out of the CLI: most block and page templates now ship in `@astryxdesign/core`, and chart/heatmap templates ship with `@astryxdesign/charts` / `@astryxdesign/lab` (the packages that own the components they showcase). The CLI resolves templates from these packages; no consumer-facing behavior changes.

@ejhammond
