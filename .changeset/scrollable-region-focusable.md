---
'@astryxdesign/core': patch
---

[fix] CodeBlock/Table/Markdown: overflowing scroll regions are now keyboard-focusable (`tabIndex`, `role="region"`) so keyboard users can scroll long code and wide tables. CodeBlock's Copy button no longer collapses the block when clicked, and is no longer nested inside the collapsible header's `role="button"` (#3343).
@cixzhang
