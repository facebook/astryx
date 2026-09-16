---
'@astryxdesign/core': patch
---

[feat] Markdown: add a semantic code-fence transform helper

Use `createMarkdownFenceTransform()` to annotate declared fenced-code languages with typed extension data while standard plugin `renderers` own presentation and text projection. `components.code` retains precedence, and declined, missing, or failed proposals preserve Markdown's accessible, copyable `CodeBlock` fallback.

@cixzhang
