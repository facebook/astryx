---
'@astryxdesign/core': patch
---

[feat] Markdown: add an opt-in math renderer

Supply `components.math` to parse `$…$` inline math and `$$…$$` display math.
The renderer receives the delimiter-free expression as `value` and its placement
as `display: 'inline' | 'block'`, so applications can connect their preferred
math typesetter without preprocessing Markdown or accepting raw HTML.

Math is off unless the renderer is present. Direct parser callers can opt in
with `{math: true}`. Existing Markdown parsing and rendering stay unchanged by
default; code stays opaque, escaped and unmatched delimiters stay literal, and
inline plugins skip math.

@cixzhang
