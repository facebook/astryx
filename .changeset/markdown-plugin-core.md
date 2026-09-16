---
'@astryxdesign/core': patch
---

[feat] Markdown: add the core plugin protocol

Use `createMarkdownPlugin()` and Markdown's `plugins` prop to compose bounded
source syntax, immutable typed AST transforms, and extension renderers. Import
`parseMarkdownAst()` or `parseInlineAst()` from
`@astryxdesign/core/Markdown/parser` when server code needs the canonical tree.
The same ordered plugins work with parser entry points and Markdown-derived
Outline items, while omitted or empty plugin lists preserve existing behavior.

@cixzhang
