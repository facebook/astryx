---
'@astryxdesign/core': patch
---

[fix] A toast that is leaving no longer holds its `uniqueID`. Before, closing a toast and showing one with the same `uniqueID` during its exit dropped the new toast when its `collisionBehavior` was `'ignore'`, and with `'overwrite'` pulled the closed toast back on screen as the new one. The leaving toast now finishes its exit and the new one is shown.

@vjeux
