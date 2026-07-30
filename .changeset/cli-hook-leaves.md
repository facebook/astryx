---
'@astryxdesign/cli': patch
---

[refactor] CLI: hook reorganized into api/hook leaf shape — `hook.mjs` is now a dispatcher+barrel routing to colocated leaves (`list/list.mjs` → hook.list, `detail/detail.mjs` → hook.detail, `detail/params/params.mjs` → hook.detail.params) over a shared `_adapter.mjs` resolver. Pure reorg: `--json` and human output are byte-identical across all modes, and the `hook` export surface (api/index.mjs + CLI) is unchanged.
@josephfarina
