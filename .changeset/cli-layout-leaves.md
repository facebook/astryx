---
'@astryxdesign/cli': patch
---

[refactor] CLI: layout reorganized into the api/layout leaf shape — a shared `_adapter.mjs` (`analyze`/`loadBlocks`/`formatIssue` over `lib/xle`) with thin `expand/`, `check/`, and `grammar/` leaves, plus a `layout.mjs` barrel. `api/index.mjs` and the CLI are unchanged (they import via the barrel). Pure reorg: `layout expand`/`check`/`grammar` `--json` envelopes and human output are byte-identical.
@josephfarina
