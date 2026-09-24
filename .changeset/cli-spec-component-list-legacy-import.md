---
'@astryxdesign/cli': patch
---

[fix] `astryx component --list` now prints the right import for components from packages that publish docs through the legacy `astryx.docs` field. It used to show an `@astryxdesign/core` path for them. The JSON list entries now carry the same `import` that `astryx component <Name>` reports for each of those components.

@josephfarina
