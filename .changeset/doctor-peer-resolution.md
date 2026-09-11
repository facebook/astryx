---
'@astryxdesign/cli': patch
---

[fix] doctor: range-check every peer against the project's own node_modules, so a peer that is only reachable from the ambient environment no longer reads as installed (#5327)
@Han5991

`checkPeerDeps` resolved each peer with `require.resolve(name, {paths: [cwd]})`.
Node folds `NODE_PATH` into that lookup regardless of `paths`, so a peer merely
reachable from the ambient environment resolved, and doctor reported nothing
while the project itself was missing it. It now walks the project's own
`node_modules` and reads each `package.json` off disk, so a missing peer is
reported and an installed one is checked against the declared range.

Yarn Plug'n'Play projects have no `node_modules` for that walk to find, so the
lookup asks the PnP runtime when the walk comes up empty. PnP resolves from the
project's own dependency graph and ignores `NODE_PATH`, which keeps the answer
project-local. A PnP project now gets its peers range-checked too — previously
`require.resolve` could confirm a peer was present there but not read its
version, because Core does not export `./package.json`.
