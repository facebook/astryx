---
'@astryxdesign/core': patch
---

[feat] CodeBlock: add `codeblock-header` and `codeblock-title` theme targets on the header row and the title/language-label element. A theme can now restyle the header (e.g. padding) and the title (e.g. font size) directly, instead of reaching them through structural `> div:first-child > div > span` selectors that reverse-engineer the header layout. Both reflect the `size`/`language`(`/container`) visual props like the root. (#4943)

@freddymeta
