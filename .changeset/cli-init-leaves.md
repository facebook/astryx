---
'@astryxdesign/cli': patch
---

[refactor] CLI: init reorganized into api/init leaf shape — `init.mjs` is now a dispatcher + barrel that routes to `api/init/run/run.mjs` (the default / `--features` / `--all` install path) and `api/init/remove/remove.mjs` (the `--remove-agents` path), with the shared plain-logger contract in `api/init/_adapter.mjs`. Pure reorg: `getNextSteps`, `noopInitLogger`, and the `InitOptions` / `InitLogger` types stay re-exported from the barrel, so api/index.mjs, the CLI command, and the programmatic API are unchanged. Human and `--json` output are byte-identical.

@josephfarina
