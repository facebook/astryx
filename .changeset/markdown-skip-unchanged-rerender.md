---
'@astryxdesign/core': patch
---

[perf] Markdown skips re-rendering its document when a parent re-renders without changing the text or any rendering prop, so pages that update around a long document stay responsive; a link handler passed as a new function on each render no longer forces that work, and the rendered output is unchanged.

@cixzhang
