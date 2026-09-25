---
'@astryxdesign/core': patch
---

[fix] Keep numeric zero aligned in ChatMessageBubble name and metadata slots. (#6600)

The aligned wrappers are omitted for non-rendering scalar values (`null`,
`undefined`, booleans, and the empty string), while numeric `0` remains visible
inside the same inset as other slot content.

@cixzhang
