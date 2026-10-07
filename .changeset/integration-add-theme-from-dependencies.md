---
'@astryxdesign/cli': patch
---

[fix] `astryx integration add theme <name> --from <base>` now adds the packages the copied theme files import to `dependencies`.

A fork of a bundled theme such as `neutral` copies its `icons.tsx`, which imports `lucide-react`, but the package did not declare it. So `astryx theme build` on the fork failed with "Cannot find module 'lucide-react'", and an app that installed the package hit the same error. `--from` now adds each package the copied files import, at the range the bundled themes use. It leaves out Core and React, which every Astryx app already has, and anything the package already declares.

@josephfarina
