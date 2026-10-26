---
'@astryxdesign/core': patch
---

[fix] BottomSheet: at rest, a sheet's content starts below the grab bar whatever its `padding`, so the first line is no longer drawn through the bar's fade. Scrolled content still passes beneath the bar. A sheet at the default padding starts its content 8 px lower; one with `padding={0}` keeps its content clear of the bar.

@vjeux
