---
'@astryxdesign/cli': patch
---

[fix] The 0.6 `rename-resizable-pixel-bounds` upgrade codemod now also renames `minSizePx`/`maxSizePx` in static inline `useResizable` configurations called through a namespace import (`Astryx.useResizable({...})`) or wrapped in `as const` or `satisfies`. These were left unchanged before.

@josephfarina
