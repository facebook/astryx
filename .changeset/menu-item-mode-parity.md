---
'@astryxdesign/cli': minor
'@astryxdesign/core': minor
---

[breaking] DropdownMenu's two item modes are peers again. Compound mode gains a `DropdownMenuDivider` component (aliased as `ContextMenuDivider` and `BreadcrumbMenuDivider`), which the data path also renders, so `{type: 'divider'}` and `<DropdownMenuDivider />` produce identical DOM, spacing, and theme target. Data mode gains `endContent` and `description`, so an `items` row can carry a shortcut hint or secondary text without dropping to compound mode. Its `label` widens from `string` to `ReactNode`, matching compound mode: the narrowing existed only because rows were keyed by label, and they no longer are (#4953).

The bare names now belong to those components, so the data-mode option types take the `Data` suffix their sibling `DropdownMenuItemData` already carries: `DropdownMenuDivider` → `DropdownMenuDividerData`, `ContextMenuDivider` → `ContextMenuDividerData`, `BreadcrumbMenuDivider` → `BreadcrumbMenuDividerData`. TypeScript cannot re-export a value and a type under one name from a single barrel, so the rename is what makes the components exportable at all. Run `astryx upgrade --apply` to rewrite the type imports; a missed one fails at compile time rather than silently.

@cixzhang
