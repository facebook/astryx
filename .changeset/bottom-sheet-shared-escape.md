---
'@astryxdesign/core': patch
---

[fix] A standalone `BottomSheet` now joins the shared layer dismissal stack, so one Escape press closes only the top-most layer. A Popover, Dialog, or menu opened inside the sheet closes first, and the next press closes the sheet. `purpose="required"` still blocks Escape without letting the press close a layer behind it, a sheet that is animating out keeps the press, and the native close request answers with the same top-most and IME composition rules.

@harjothkhara
