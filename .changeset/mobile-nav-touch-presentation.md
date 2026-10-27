---
'@astryxdesign/core': patch
---

[fix] Under a finger, MobileNav takes no touch until its slide-in ends, and after a close its leaving drawer takes no input until the dialog closes, on the close's own timing (at most 250 ms). Under a mouse nothing changes.

@vjeux
