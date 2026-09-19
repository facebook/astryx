---
'@astryxdesign/core': patch
---

[feat] Markdown: add native typed frontmatter metadata

Use `createMarkdownFrontmatter()` from `@astryxdesign/core/Markdown/plugins` to decode a document-start key/value block into typed metadata, keep unfinished streaming metadata hidden, and remove completed metadata syntax from rendered Markdown.

@cixzhang
