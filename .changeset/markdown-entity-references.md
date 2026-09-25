---
'@astryxdesign/core': patch
---

[feat] Markdown: add configurable entity references

Use `markdownEntityReferencesPlugin()` with ordered global matchers to recognize product-owned entity grammars, synchronously resolve matches to accessible labels and optional safe destinations, and preserve declined or protected source text. The public `composeMarkdownTransforms()` helper preserves ordered transform fast paths for this and other multi-transform plugins.

@cixzhang
