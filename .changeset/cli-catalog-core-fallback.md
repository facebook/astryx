---
'@astryxdesign/cli': patch
---

[feat] Catalog commands (`component`, `hook`, `search`, `theme targets`) now answer from the `@astryxdesign/core` installed beside the CLI when the project has no Core of its own, instead of failing with `ERR_CORE_NOT_FOUND`. A project's own Core still wins, and `doctor`, `swizzle` and `theme build` still look only at the project.

@josephfarina
