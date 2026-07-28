---
'@astryxdesign/cli': patch
---

[refactor] CLI: docs reorganized into api/docs leaf shape — `docs()` in `api/docs/docs.mjs` is now a dispatcher + barrel that routes by argument shape into three leaves (`api/docs/list`, `api/docs/detail`, `api/docs/detail/section`), each projecting into a single `{ type, data }` envelope. The discovery, overlay loading, and topic resolution shared by ≥2 leaves live in `api/docs/_adapter.mjs`. Pure reorganization: the `docs` export, `api/index.mjs`, the CLI consumer, and all `--json` and human output are unchanged (byte-identical).
@josephfarina
