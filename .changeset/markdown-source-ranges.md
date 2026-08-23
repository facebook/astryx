---
'@astryxdesign/core': patch
---

[feat] Markdown: opt-in source ranges on parsed blocks

`parseMarkdown(source, {sourceRanges: true})` now gives every top-level block a
`range` — the `[start, end)` offsets it occupies in the source that was passed
in — so a consumer holding that source can slice the original markdown for a
block instead of reconstructing it from the node (or from the rendered DOM).
Reconstruction is lossy in ways slicing is not: escapes, the exact emphasis and
fence characters, heading depth beyond the clamp, and alignment all survive a
slice unchanged.

Off by default and absent unless asked for, so no existing node, snapshot or
comparison changes.

Two things the offsets get right that a naive implementation does not: link
reference definitions are stripped before the block loop runs, and the ranges
are reported against the string the caller passed rather than the stripped
text; and `parseMarkdownIncremental` parses slices, so blocks report absolute
offsets into the whole document as it streams — including a list whose halves
arrived in separate chunks and were merged.

A range covers a block's own lines verbatim, so slicing it and parsing the
result gives the same node back.

Blocks nested inside a list item or a blockquote carry no range: their children
are parsed from text the parser reassembled with markers and `>` prefixes
removed, so an offset into it would not address the document.

@lexs
