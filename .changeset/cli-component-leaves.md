---
'@astryxdesign/cli': patch
---

[refactor] CLI: `component` reorganized into the `api/component` leaf shape over a shared `_adapter` resolver — `component.mjs` is now a dispatcher + barrel that routes to per-type leaves (`list`, `detail`, `detail/props`, `detail/source`, `detail/showcase`, `detail/blocks`), each a thin projection of a subject the adapter resolves once (core/external/scoped/integration ownership, ambiguity handling, and fuzzy search, deduped). Pure reorg: every `--json` envelope and human output stays byte-identical across all modes.
@josephfarina
