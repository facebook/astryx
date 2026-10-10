---
'@astryxdesign/core': patch
---

[perf] An `Item` without `swipeActions` no longer bundles the swipe gesture. The panels and the drag that uncovers them now live in a module `Item` loads on demand the first time a row has swipe actions, so an app whose rows never swipe ships about 2.7 KB (gzip) less on its first load and a row that does swipe keeps its DOM, props and behavior; its gesture becomes live once that module has arrived, which on a first load is a moment after the row paints.

@vjeux
