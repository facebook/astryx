---
'@astryxdesign/core': patch
---

[fix] A `Section` nested inside a `BottomSheet` no longer overflows the sheet when an ancestor of the sheet's trigger sets `--container-padding-*` (e.g. a page container, or another `Section`). `Section` escapes its parent's padding via a negative margin driven by those CSS variables; a `BottomSheet` is a fixed-position overlay but is still a DOM descendant of whatever container opened it, so it inherited those vars even though it has visually left the container's box, and a nested `Section` escaped padding that was never actually there. `BottomSheetPanel` now resets `--container-padding-*` to `0px` for its own descendants, the same way `Section`'s own inner wrapper already resets it for its children.

@HelloOjasMutreja
