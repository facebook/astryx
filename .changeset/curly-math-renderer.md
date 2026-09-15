---
'@astryxdesign/core': patch
---

[feat] Markdown: add an opt-in math renderer (#6312)

Supply `components.math` to parse `$…$` inline math and `$$…$$` display math.
The renderer receives the delimiter-free expression as `value` and its placement
as `display: 'inline' | 'block'`, so applications can connect their preferred
math typesetter without preprocessing Markdown or accepting raw HTML.

Math is off unless the renderer is present. Direct parser callers can opt in
with `MathParseOptions` (`{math: true}`) and incremental callers create
`IncrementalParseState<true>` via `createIncrementalState<true>()`. Those overloads return `InlineNodeWithMath` or
`BlockNodeWithMath`; default, legacy-set, `math: false`, and `ParseOptions`-
annotated calls retain the existing `InlineNode` and `BlockNode` unions, so
exhaustive consumers do not gain a case unless they opt in. Existing Markdown
parsing and rendering stay unchanged by default; code stays opaque, escaped and
unmatched delimiters stay literal, and inline plugins skip math. Incremental
parsing preserves full-parse results when display math is nested in ordinary or
task lists and blockquotes, including quote-depth transitions, with LF or CRLF
and with source ranges enabled.

@cixzhang
