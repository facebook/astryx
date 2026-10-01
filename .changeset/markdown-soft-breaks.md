---
'@astryxdesign/core': patch
---

[feat] Markdown: add the first-party soft-breaks plugin (#6459)

Use `markdownSoftBreaksPlugin` from `@astryxdesign/core/Markdown/plugins` to render soft line endings as hard breaks without preprocessing source. The plugin matches the real `remark-breaks` package through Astryx's supported adapter path while keeping code and other opaque content unchanged.

@cixzhang
