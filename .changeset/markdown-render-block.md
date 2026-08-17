---
'@astryxdesign/core': patch
---

[feat] Markdown: `renderBlock` wraps each rendered block with the source line range it came from, so rendered markdown can carry diff, change, or blame indicators. Parsing is unchanged unless the prop is set.

@cixzhang
