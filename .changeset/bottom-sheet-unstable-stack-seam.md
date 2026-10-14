---
'@astryxdesign/core': patch
---

[chore] `BottomSheet` and `BottomSheetSwitcher` read internal, `unstable_`-prefixed stack contexts (`@astryxdesign/core/BottomSheet/unstable_stack`) that let an external host present several sheets inside one shared dialog; a sheet under such a host registers itself with it from wherever it is rendered. Without such a host the contexts are null and both components behave exactly as before. The subpath is Lab-only coordination with no stability promise and is not part of the documented API.

@imdreamrunner
