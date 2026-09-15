---
'@astryxdesign/core': patch
---

[feat] Markdown: add the general plugin protocol

Use `createMarkdownPlugin()` with Markdown's additive `plugins` prop to compose
text replacements, typed inline or block syntax, language-scoped semantic
fences, extension renderers, and source-range decorations. Parser overloads
infer extension-node unions, incremental parsing tracks syntax identity and
finality, and Markdown and Outline share extension text projection for heading
IDs.

Existing Markdown, parser, `components`, and `inlinePlugins` behavior remains
unchanged when plugins are omitted.

@cixzhang
