---
'@astryxdesign/core': patch
---

[fix] When several picked or dropped files break `accept`, `maxSize` or `maxFiles`, `FileInput` names every rejected file and why in its status message, not only the first. The message is listed in the active locale.

@cixzhang @duytbp
