---
'@astryxdesign/cli': patch
---

[fix] theme build: only treat a core the theme's own node_modules chain can reach as one a CommonJS dependency could reach, so an ambient-only core no longer fails the build with ERR_CORE_INCOMPATIBLE (#5327)
@Han5991

`patchCommonJs` required `@astryxdesign/core` from the theme file to see whether
it could wrap `defineTheme` for `.cjs` dependencies. `require` folds `NODE_PATH`
in, and pnpm's isolated layout puts every package in
`node_modules/.pnpm/node_modules`, so a core no dependency of the theme could
reach answered that lookup. Wrapping it fails on a `require(esm)` namespace, and
the reported coverage gap then rejected any theme whose lineage was unobserved.
The lookup now walks the theme's own `node_modules` chain first, the same way
`doctor` resolves peers.
