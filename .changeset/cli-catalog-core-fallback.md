---
'@astryxdesign/cli': patch
---

[feat] Catalog commands (`component`, `hook`, `search`, `build`, `theme targets`) now answer from the `@astryxdesign/core` installed beside the CLI when the project has no Core of its own, instead of failing with `ERR_CORE_NOT_FOUND`. A project's own Core still wins, and `doctor` and `swizzle` still look only at the project. The API reference docs for those functions say so.

@josephfarina
