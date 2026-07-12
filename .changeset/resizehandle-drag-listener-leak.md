---
'@astryxdesign/core': patch
---

[fix] ResizeHandle: release window drag listeners when unmounted mid-drag

A drag in flight when the handle unmounts never receives its pointerup, so the window pointermove/pointerup/pointercancel listeners leaked — every subsequent pointer move kept resizing the still-mounted region, and the body cursor/user-select overrides stuck. Unmount now tears down the in-flight drag's listeners and restores the body styles.
@arham766
