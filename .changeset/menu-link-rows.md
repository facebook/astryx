---
'@astryxdesign/core': patch
---

[feat] DropdownMenuItem takes `href`: a menu row that navigates is a real link.

`DropdownMenuItem` (and a data-mode item) takes `href`, `target` and `rel`.
The row renders as the anchor itself, with `role="menuitem"`, routed through
`LinkProvider`, so a ⌘-click, Ctrl-click or middle click keeps the browser's
meaning and skips `onClick`; a plain click runs `onClick`, closes the menu and
navigates. The touch sheet renders the same item as a link row. `onClick` now
receives the click event. Enter and Space in every menu synthesize a click
that carries the key's modifiers.

@vjeux
