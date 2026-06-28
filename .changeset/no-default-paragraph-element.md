---
'@astryxdesign/core': patch
---

[fix] Core components (`Banner`, `EmptyState`, `Markdown`) no longer render a `<p>` by default — they render `<div>` (appearance unchanged). This avoids hydration mismatches when block content lands in a `<p>`. `Markdown` paragraphs use `role="paragraph"`; pass `components={{paragraph: 'p'}}` to opt back into `<p>`.
@cixzhang
