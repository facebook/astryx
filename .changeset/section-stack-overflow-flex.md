---
'@astryxdesign/core': patch
---

[feat] Section/Stack/StackItem: scroll + flex-item props for multi-pane layouts (#2623)

`Section` gains the `isScrollable` prop that `LayoutContent`, `LayoutPanel`, `Stack` and `StackItem` already had, and `Section`, `Stack`/`HStack`/`VStack` and `StackItem` all gain the flex-item props the layout-props standard (#3223) reserved for them: `grow` / `shrink` / `basis`. Multi-pane layouts — a fixed sidebar next to a scrolling detail column, a kanban board, a horizontal card strip — are now expressible with props instead of hand-written CSS; the `file-explorer` page template drops four of its five raw `CSSProperties` layout objects (the fifth, a `100dvh` viewport fill, is a separate concern and stays). On `Section` the props split across its two boxes: `grow`/`shrink`/`basis` go on the outer box (the flex child), the scroll on the inner painted surface, so the background, dividers and padding stay put while the content scrolls. A scrollable section also applies the flex `min-height: 0` / `min-width: 0` reset, without which a section inside a Stack grows instead of scrolling. The `stackItem()` StyleX utility gains the same options.
@AKnassa
