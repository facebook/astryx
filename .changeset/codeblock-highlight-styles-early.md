---
'@astryxdesign/core': patch
---

[perf] CodeBlock inserts its syntax-highlight rules before the first layout read instead of after it, so a page with many code blocks, such as a long Markdown document, paints about a fifth sooner on first load; the rules and the highlighted output are unchanged.

@cixzhang
