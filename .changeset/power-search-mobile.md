---
'@astryxdesign/core': patch
---

[feat] PowerSearchMobile — the touch form of PowerSearch

Same props, same filter model, same tokens; the typeahead dropdown and the
row-shaped edit popover are replaced by a pinned-tall bottom sheet that drills
down field → operator → value. Choosing an enum value commits on one tap, a
multi-select applies from a pinned footer, and tapping a token reopens that
filter with Delete available. Pick between the two variants on viewport and the
call site does not change.

@imdreamrunner
