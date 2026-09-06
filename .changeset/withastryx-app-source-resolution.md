---
'@astryxdesign/build': patch
---

[fix] `withAstryx()` now resolves an app's own `@astryxdesign/*` imports to the packages' `source` entries. The scoped webpack rule only governs requests issued from inside `node_modules`, so app code resolved the library through `default` to `dist` while PostCSS compiled it from source — the two emit disjoint class names and the app rendered unstyled without erroring. (#5932)

@PRIEYAN
