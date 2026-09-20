---
'@astryxdesign/core': patch
---

[feat] Markdown: add a limited Remark compatibility adapter (#6345)

Import `createMarkdownRemarkTransform()` from `@astryxdesign/core/Markdown/remark` to run one synchronous transform-only Remark plugin over the documented MDAST subset. Every invocation gets a fresh mutable tree and an isolated file, and each plugin's compatibility is proven by fixtures rather than assumed: async work, parser or compiler plugins, processor state, raw HTML, unsupported nodes, forged positions, and metadata Astryx cannot represent keep the last valid readable document and report one diagnostic. The adapter is a separate entry point, so it stays out of every bundle that does not import it.

@cixzhang
