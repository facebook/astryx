---
'@astryxdesign/core': patch
---

[fix] Whole-row-click expansion reuses the shared clickable-container guards instead of its own selector list. (#5995)
@ernestt

`useTableRowExpansion` and `useTableTreeData` each carried a hand-rolled copy of "did this click belong to something else" — the same nine selectors, written twice. `useClickableContainer` already owns that rule for every clickable surface in the system, and its `INTERACTIVE_SELECTORS` list is the fuller one: it also covers `role="link"`, `radio`, `switch`, `tab`, `menuitem`, `option`, `combobox`, `listbox`, `slider`, `spinbutton` and `[data-pressable-container]`, and it excludes `[aria-readonly="true"]`.

Both plugins now call the hook's `hasInteractiveAncestor` and `hasTextSelection`, newly exported for containers that cannot use the hook itself — a `<tr>` assembled inside `transformBodyRow` has no ref to hand it.

Two behaviour changes fall out of sharing, both fixes:

- A click on a composed control the short list missed — a `role="tab"`, a segmented `role="radio"`, a `Slider` in a cell — no longer toggles the row underneath it.
- The text-selection guard is scoped to the row instead of asking the document for any selection at all. Text selected elsewhere on the page no longer makes every row in the table inert.

The walk also stops at the row rather than climbing to `document.body`, so an interactive ancestor of the whole table cannot suppress row clicks.
