---
'@astryxdesign/core': patch
---

[feat] Let a TreeList item carry row styles (#6238)
@ernestt

`TreeListItemData` gains `xstyle`, `className`, and `style`, applied to the
item's row element, as the TreeList contract's per-item styling seam requires.

`TreeList` takes rows as data, so nothing previously handed back the row's
element. That prevents row-scoped primitives such as `useContainerReveal` from
installing the class and inline custom properties that jointly isolate each
row's hover and focus state; applying the reveal to the whole tree would expose
every row action at once.

`Item` already accepts the same row styling props, so a list converting to a
tree keeps its reveal wiring instead of having to mark the whole tree.
