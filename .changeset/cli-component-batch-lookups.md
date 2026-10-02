---
'@astryxdesign/cli': patch
---

[feat] `astryx component` accepts several exact selectors in one call. The JSON response keeps one ordered row per selector, including missing and ambiguous components, and text mode prints every row before exiting nonzero when any lookup fails. The `component()` API accepts selector arrays and always returns `component.batch` for an array, including empty and one-item arrays. Batches accept up to 100 selectors and reject larger arrays before lookup. The public API also exports shared `BatchResponse` and `BatchRow` types for typed receipts.

@josephfarina
