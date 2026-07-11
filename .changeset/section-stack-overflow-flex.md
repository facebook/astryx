---
'@astryxdesign/core': patch
---

[feat] Section/Stack/StackItem: overflow + flex-item props for multi-pane layouts (#2623)

`Section`, `Stack`/`HStack`/`VStack` and `StackItem` gain the two prop families the layout-props standard (#3223) reserved for them: `overflow` (`'visible' | 'hidden' | 'clip' | 'auto' | 'scroll'`) with the existing `isScrollable` boolean as sugar, and the flex-item props `grow` / `shrink` / `basis`. Multi-pane layouts — a fixed sidebar next to a scrolling detail column, a kanban board, a horizontal card strip — are now expressible with props instead of hand-written CSS; the `file-explorer` page template drops all five of its raw `CSSProperties` layout objects. On `Section` the props split across its two boxes: `grow`/`shrink`/`basis` go on the outer box (the flex child), `overflow` on the inner painted surface, so the background, dividers and padding stay put while the content scrolls. Non-visible overflow also applies the flex `min-height: 0` / `min-width: 0` reset, without which a section inside a Stack grows instead of scrolling. The `stackItem()` StyleX utility gains the same options, and a new `flexItem()` utility is exported from `@astryxdesign/core/Layout`.
@AKnassa
