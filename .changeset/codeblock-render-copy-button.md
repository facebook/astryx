---
'@astryxdesign/core': patch
---

[feat] CodeBlock: add a `renderCopyButton` render prop to supply a custom copy control. The block keeps ownership of placement, the clipboard write, the copied-state timer, and the copy announcement — the render prop only provides the visual button, wired to the passed `copy`/`isCopied`/`label`. Ignored when `hasCopyButton` is `false`.

@freddymeta
