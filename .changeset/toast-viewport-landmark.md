---
'@astryxdesign/core': patch
---

[fix] Toast: the viewport is a landmark only while it holds a toast.

`ToastViewport` rendered `role="region"` with a fixed accessible name at all
times, and `LayerProvider` mounts one for every app whether or not a toast is
ever shown. So every app carried an empty named region in the screen reader's
landmark list, and a second viewport anywhere — a dialog's, or one a sub-tree
mounts to configure position — produced two identically named landmarks, which
is an axe `landmark-unique` violation.

The role and its label now appear with the first toast and go with the last
one, including across the exit transition. F6 is unaffected: the handler works
off the ref, not the role.

@freddymeta
