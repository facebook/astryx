---
'@astryxdesign/cli': patch
---

[refactor] CLI: discover reorganized into api/discover leaf shape (list, detail, detail/doc, search) behind a shared _adapter that owns external-package discovery and doc loading; discover.mjs is now a dispatcher+barrel keeping the same exports. Pure reorg — `--json` and human output are byte-identical and api/index.mjs + the CLI consumer are untouched. Adds colocated leaf tests.
@josephfarina
