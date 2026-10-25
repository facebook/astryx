---
'@astryxdesign/core': patch
---

[internal] AlertDialog's touch tracking runs on the shared action-group tracker, the one any gesture recognizer can drive (a menu tracking the finger that opened it from its trigger, a segmented control, a page control). AlertDialog's behavior is unchanged.

@vjeux
