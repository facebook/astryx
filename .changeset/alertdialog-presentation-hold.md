---
'@astryxdesign/core': patch
---

[chore] AlertDialog: under a finger, its presentation and dismissal hold input through the shared Layer presentation hold instead of its own guards. While it fades out its content is inert and focus leaves it, then returns to the opener as before.

@vjeux
