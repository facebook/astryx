---
'@astryxdesign/core': patch
---

[fix] Dialog/Modal/Sheet: pressing Escape inside a modal opened from within another modal now closes only the top-most one, instead of closing both. Every overlay that dismisses on Escape — focus-trap overlays (Popover, menus) and native `<dialog>` overlays (Dialog and its Sheet/drawer variant) — now shares one Escape stack via the new `useEscapeStack` hook, and only the top-most layer (resolved by DOM containment) handles the press and stops it propagating. Previously each open `<dialog>` ran its own Escape listener without stopping propagation, so an inner dialog's Escape also bubbled to the DOM-nested outer dialog and dismissed it too. No API change.
@freddymeta
