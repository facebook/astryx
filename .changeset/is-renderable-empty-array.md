---
'@astryxdesign/core': patch
---

[fix] `isRenderable` now returns `false` for an empty array. `endContent={items.map(…)}` over an empty list renders nothing, but the util reported it as content, so every slot guarded by it drew its wrapper around empty space — a trailing divider in a toolbar, a separator with nothing after it. Empty string, `null`, `undefined`, and booleans behaved correctly already; `0` still counts as content, because it renders the character "0".

@AKnassa
