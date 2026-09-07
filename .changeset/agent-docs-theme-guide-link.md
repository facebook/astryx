---
'@astryxdesign/cli': patch
---

[docs] Agent docs: point agents at `astryx docs theme` the way the block already does for `astryx docs layout`, and list `theme add|build` in the CLI reference. Theming previously got a single clause and `astryx theme build` was never mentioned, so agents reached for per-instance `xstyle` instead of the theme. The new rule triggers on restyling the same component twice, since repetition — not a single override — is the signal that something belongs in the theme.
@josephfarina
