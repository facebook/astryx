---
'@astryxdesign/core': patch
---

[fix] `Button` docs: remove the `--button-disabled-opacity` and `--button-press-scale` theme vars. They were documented but never consumed by the component — the disabled opacity and active press scale are intentionally fixed values, not themeable — so overriding them had no effect. The docs now reflect what the component actually exposes (#4423).

@cixzhang
