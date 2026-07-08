---
'@astryxdesign/core': patch
---

[fix] Table now honors the standard root styling props: `className`, `style`, `xstyle`, `id`, `aria-*`, `data-*`, and other HTML attributes reach the root `<table>` element instead of being silently dropped. `tableProps` is deprecated (still works, loses conflicts to direct props); the computed column min-width still wins over a consumer `style.minWidth`, but no longer clobbers it when columns compute none (#3679)
@AKnassa
