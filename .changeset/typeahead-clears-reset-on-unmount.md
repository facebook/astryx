---
'@astryxdesign/core': patch
---

[fix] useTypeahead clears its pending buffer reset when its component unmounts, so a menu, list or selector removed within 750 ms of a typed character leaves no timer running behind it
@vjeux
