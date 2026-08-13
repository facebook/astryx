---
'@astryxdesign/core': patch
---

[fix] `useScrollLock`: coordinate concurrent locks with a shared counter, so overlays closing out of order no longer unlock the body early or leave it stuck locked. (#4788)

@alex-js-ltd
