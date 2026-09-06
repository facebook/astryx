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

