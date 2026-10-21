---
'@astryxdesign/build': patch
---

[fix] The PostCSS plugin now scans what each installed Astryx package publishes (its `files` field, or the whole package minus nested `node_modules` when it has none) instead of everything under `node_modules/@astryxdesign`. A package linked from a workspace no longer drags in its own `node_modules`, whose links can cycle back to it and made the build run out of memory, or its unpublished test fixtures. Registry installs scan the same files as before.
@vjeux
