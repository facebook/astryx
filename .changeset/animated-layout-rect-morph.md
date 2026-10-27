---
'@astryxdesign/core': patch
---

[chore] Internal: the size-change glide plays its translate through the shared rect morph (`architecture:react-component-runtime` INV12): one translate per moving element on `springs.settle`, on a path that keeps the element's size, started on the same clock as the changed element's entrance. Nothing public changes.

@vjeux
