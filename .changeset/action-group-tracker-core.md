---
'@astryxdesign/core': patch
---

[internal] The action-group tracking behind AlertDialog's touch handling is a plain tracker that any gesture recognizer can drive (begin, move, end, cancel, offsetBy), so a menu can track the finger that opened it from its trigger. AlertDialog's behavior is unchanged.

@vjeux
