---
'@astryxdesign/core': patch
---

[feat] DialogHeader: add end-content edge compensation control

DialogHeader now accepts `endContentEdgeCompensation="inline" | "block" | "all"` to select which axes of its existing end-content wrapper receive fixed compensation. Omitting the prop preserves the current automatic compensation whenever the close action renders.

@cixzhang
