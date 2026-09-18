---
'@astryxdesign/core': patch
---

[fix] BaseTypeahead: invalidate a replaced `searchSource` during render instead of in an effect cleanup, so the previous source is cancelled and its in-flight results discarded in the same pass that swaps it. Follow-up to #6357; no behavior change.

@nynexman4464
