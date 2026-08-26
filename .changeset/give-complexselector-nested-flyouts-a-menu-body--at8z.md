---
'@astryxdesign/core': patch
---

[feat] Add `Menu`, a standalone `role="menu"` body with roving focus, typeahead and Tab-closes but no trigger and no layer of its own, and a `popupRole` prop on `ComplexSelector`. Together they let a selector popup host a nested flyout: compose `Menu` + `DropdownMenuSubMenu` under `popupRole="none"` and the flyout is its own top-layer element instead of being clipped by the popup's scrolling content box. `DropdownMenu` now renders the same `Menu` body — no API change. (#4985)
@AKnassa
