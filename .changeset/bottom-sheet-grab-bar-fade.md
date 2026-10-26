---
'@astryxdesign/core': patch
---

[fix] BottomSheet: the grab bar's fade ends where the content's default top padding does, so a sheet's first line is no longer drawn through it. The content still starts at the sheet's top edge and scrolls beneath the bar.

@vjeux
