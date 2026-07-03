---
'@astryxdesign/core': patch
---

[feat] New `Accent` component — re-accent a subtree at runtime without building a second theme (#3495). Wraps children and re-derives the accent-family tokens (`--color-accent`, `--color-accent-muted`, `--color-on-accent`, `--color-text-accent`, `--color-icon-accent`) from a single seed color using the same HCT formulas as theme generation, now shared via the exported `deriveAccentFamily()`.
@AKnassa
