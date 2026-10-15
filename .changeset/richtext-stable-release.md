---
'@astryxdesign/richtext': patch
---

[feat] `@astryxdesign/richtext` is now a stable package, released together with `@astryxdesign/core` at the same version. Install it without the `@canary` tag: `npm install @astryxdesign/richtext`. It provides `RichTextEditor`, `RichTextView`, `RichTextEditorToolbar`, `RichTextEditorAutoLinkPlugin`, the headless Markdown serializers (also at `@astryxdesign/richtext/markdown`), and Markdown plugin support through `createRichTextExtension`. `RichTextView` and core `Markdown` render the same document the same way, and Markdown that is imported and exported without edits comes back byte for byte. `lexical` and the `@lexical/*` packages remain optional peer dependencies.

@cixzhang
