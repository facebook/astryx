---
'@astryxdesign/cli': patch
---

[fix] A component family lists the same members whether or not its package has been built. When the package's `exports` give a `source` condition and that file is in the package, the CLI reads the family's members from it instead of from the built output. Before, a member that only the package's entry exports, such as Lab's `TourStep`, was listed only after a local build. The official package list now includes `TourStep`.

@josephfarina
