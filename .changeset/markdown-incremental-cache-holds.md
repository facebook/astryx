---
'@astryxdesign/core': patch
---

[fix] Markdown streaming: `parseMarkdownIncremental` no longer throws away its settled blocks while a code fence is open, or when a chunk happens to end on a newline — both re-parsed the whole document, so a long streamed response got slower the longer it grew. Blocks rebuilt across a streamed 500-paragraph document: 126,756 → 1,869 (#5407).
@cixzhang
