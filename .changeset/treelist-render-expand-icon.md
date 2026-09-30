---
'@astryxdesign/core': patch
---

[feat] TreeList: new `renderExpandIcon` prop to customize the expand/collapse indicator. It is called per item with `{isExpanded, hasChildren, isDisabled}`, so a file tree can render closed/open folder icons on expandable rows and a file icon in the indicator slot of leaves. Custom icons swap per state instead of rotating (the chevron rotation animation is suppressed); returning null falls back to the default chevron for parents and to no indicator for leaves. The indicator column is `1rem` — the same box as `<Icon size="sm">` — so `sm` custom icons and the default chevron (no longer re-pinned to `--spacing-4`) fill it at any root font size. The toggle's accessibility wiring (aria-expanded, aria-label, roving tabindex, `data-tree-toggle`) is unchanged regardless of the icon rendered inside it. Also exports the `TreeListExpandIconState` type. See #4131.

@AKnassa
