---
'@astryxdesign/core': patch
---

[fix] When one standalone `BottomSheet` replaces another and the entering sheet is shorter, the sheet being replaced moves down to the entering sheet's top edge while the entering sheet rises, and only then fades, so the switch reads as one sheet changing height, as a `BottomSheetSwitcher` step change does. It had stayed at its own height and faded out above the entering sheet. Under reduced motion the replaced sheet still does not move.

@imdreamrunner
