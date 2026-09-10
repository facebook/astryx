---
'@astryxdesign/core': patch
---

[feat] Let a TreeList item carry a class on its row

`TreeListItemData` gains `className`, applied to the item's row element.

`TreeList` takes rows as data, so nothing previously handed back the row's
element. That is a problem specifically for StyleX markers: a marker's class
is the only way to scope `stylex.when.ancestor()` to a single row, so a
consumer wanting an action in `endContent` to reveal on that row's hover had
no row to mark and had to mark the whole tree — at which point every row's
action reveals at once.

`Item` already accepts `className` for exactly this, so the gap showed up as
a regression when converting a list to a tree: the same reveal that worked
per row on `Item` could only work per tree on `TreeList`. The class lands on
the row box rather than the `<li>`, which is the boundary a consumer means by
"this row", and it is merged last so it wins ties.

@ernestt
