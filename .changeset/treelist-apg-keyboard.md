---
'@astryxdesign/core': patch
---

[feat] TreeList now implements the full WAI-ARIA APG Tree View keyboard pattern. Roving tabindex places a single tab stop on the treeitem rows (defaulting to the selected item or the first enabled row), and arrow keys move focus in visible order: ArrowDown/ArrowUp step between visible rows (skipping disabled), ArrowRight expands a collapsed parent then enters its first child, ArrowLeft collapses an expanded parent or moves to the parent row, and Home/End jump to the first/last visible row. Enter and Space activate the row's action (or toggle a parent without its own action), and typeahead moves focus to the next row whose label matches the typed characters. Each treeitem now also exposes `aria-level`, `aria-posinset`, and `aria-setsize`. Builds on the interim keyboard-expandable toggle in (#3344). Part of the accessibility & keyboard-management program (#3343).
@cixzhang
