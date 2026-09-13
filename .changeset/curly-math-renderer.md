---
'@astryxdesign/core': patch
---

[feat] Markdown: add an opt-in math renderer

Supply `components.math` to parse `$…$` inline math and `$$…$$` display math.
The renderer receives the delimiter-free expression as `value` and its placement
as `display: 'inline' | 'block'`, so applications can connect their preferred
math typesetter without preprocessing Markdown or accepting raw HTML.

Math is off unless the renderer is present. Direct parser callers can opt in
with `{math: true}`. Those overloads return `InlineNodeWithMath` or
`BlockNodeWithMath`; default and legacy calls retain the existing `InlineNode`
and `BlockNode` unions, so exhaustive consumers do not gain a case unless they
opt in. Existing Markdown parsing and rendering stay unchanged by default; code
stays opaque, escaped and unmatched delimiters stay literal, and inline plugins
skip math. Incremental parsing preserves full-parse results when display math is
nested in list items or blockquotes, including when source ranges are enabled.

@cixzhang
