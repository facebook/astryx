---
'@astryxdesign/core': patch
---

[fix] Render generated id attributes on Markdown headings so Outline hash links scroll to their target. Heading slugs now come from parser helpers shared with parseOutlineFromMarkdown, and the components.heading override receives the generated id (#4765).
@jiunshinn
