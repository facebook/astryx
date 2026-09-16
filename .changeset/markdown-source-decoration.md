---
'@astryxdesign/core': patch
---

[feat] Markdown: add an immutable source-decoration helper

Use `createMarkdownSourceDecoration()` to attach non-visual metadata to every block a validated UTF-16 source range touches, and `getMarkdownSourceDecorations()` to read it back in a later plugin. It works through `<Markdown>` and Outline with no extra parser options, resolves independently of the order earlier transforms left blocks in, and appears on the settled document rather than on partial streaming chunks, so a decoration never appears and then vanishes. Metadata lives in one versioned Astryx-owned envelope that never merges foreign node data. Rendered output, copyable text, accessible names, heading ids, focus order, navigation, and source provenance are unchanged.

Markdown transforms also got faster, and a plugin now always observes a fully immutable tree — including blocks a Core helper carried over untouched. Core-authored helpers now validate the nodes a caller's callback produced and run on a trusted path that skips the whole-tree validation and freezing applied to plugin-authored output, freezing walks only what a transform changed, a plugin list that contributes no inline syntax no longer costs anything per source character, and the helpers' per-match allocations and rebuilds are gone. The representative three-helper set now adds about 20 percent over an empty pipeline, inside its 25 percent budget, down from roughly 3.3x.

@cixzhang
