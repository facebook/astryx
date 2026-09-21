---
'@astryxdesign/core': patch
---

[feat] DialogHeader: expose the start- and end-content wrappers as theme targets

Adds `dialog-header-start-content` and `dialog-header-end-content` so themes can style the existing content-slot wrappers without relying on their DOM positions. The end-content slot also contains the optional close button. Default layout and behavior are unchanged.

@ksying
