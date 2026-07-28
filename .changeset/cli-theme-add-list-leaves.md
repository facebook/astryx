---
'@astryxdesign/cli': patch
---

[refactor] CLI: `theme add`/`list` are reorganized into the fractal `api/theme/` leaf shape — a shared `_adapter.mjs` (bundled-theme manifest reader + slug resolver) with thin `add/` (copy → `theme.add` receipt) and `list/` (`theme.list`) leaves over it, plus a `theme.mjs` barrel, mirroring the `theme build` extraction (#4462). `themeList()` is now exported from `@astryxdesign/cli/api` alongside `themeAdd`. Pure reorg: `theme list`/`add` `--json` envelopes and human output are byte-identical, with new direct-API tests for both leaves.
@josephfarina
