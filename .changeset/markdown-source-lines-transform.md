---
'@astryxdesign/core': patch
---

[fix] With `markdownSourceLinesPlugin` installed, a transform plugin no longer falls back to its readable fallback on documents that contain a list or a quote. Blocks nested in a list item or a quote carry lines without offsets, and the transform check now accepts those Core-assigned lines while still refusing a transform that adds, shifts, or forges them. (#7345)

@cixzhang
