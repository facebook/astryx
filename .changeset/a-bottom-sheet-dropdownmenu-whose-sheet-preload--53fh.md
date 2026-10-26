---
'@astryxdesign/core': patch
---

[fix] A bottom-sheet DropdownMenu whose sheet preload fails (a dropped connection) no longer reports an unhandled promise rejection, and its next open loads the sheet's actions again instead of failing until a reload. (#8478)
@vjeux
