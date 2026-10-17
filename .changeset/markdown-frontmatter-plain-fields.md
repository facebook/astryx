---
'@astryxdesign/core': patch
---

[fix] `createMarkdownFrontmatter` now hands its `parse` function a plain object, so a parser that returns the decoded fields unchanged (`parse: fields => fields`) is accepted as metadata. Before, the record had no prototype, failed the JSON-like metadata check, and the document fell back to readable text with its frontmatter still showing.

@cixzhang
