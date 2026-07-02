---
'@astryxdesign/core': patch
---

[docs] Link: document `type="inherit"` for inline links. The value was already supported (forwarded to `Text`, which renders `font-size`/`line-height: inherit`), but undocumented — clarified the `type` prop JSDoc, added an inline-link example, and added regression tests covering the inherit/default-body behavior (#2927)
@durvesh1992
