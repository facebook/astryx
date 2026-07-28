---
'@astryxdesign/cli': patch
---

[refactor] CLI: `build` reorganized into the `api/build` leaf shape — `build.mjs` is now a dispatcher + barrel that routes no-query → `build.help` (`api/build/help/help.mjs`) and a query → `build.kit` (`api/build/kit/kit.mjs`), with each leaf projecting its single `{type, data}` envelope. Pure reorganization: the `build` export, the `./api` barrel, and the CLI consumer are unchanged, and the `--json` and human output stay byte-identical for existing usage.
@josephfarina
