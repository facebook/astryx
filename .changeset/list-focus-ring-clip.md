---
'@astryxdesign/core': patch
---

[fix] List: a focused interactive row shows its whole focus ring. The list's inline clip (which keeps a swiped row inside the list) used to cut the ring's start and end sides; the clip edge now sits the ring's reach outside the rows, with no change to the rows' size or position.

@cixzhang
