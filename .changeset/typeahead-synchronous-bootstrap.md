---
'@astryxdesign/core': patch
---

[perf] Typeahead: skip the loading cycle for synchronous bootstrap sources (#5955)

`BaseTypeahead` now applies an array returned by `SearchSource.bootstrap()` immediately instead of entering and leaving the asynchronous loading state. An empty synchronous bootstrap becomes a render no-op, while synchronous entries still open normally. Switching from an in-flight search to a synchronous bootstrap also clears the superseded search's loading state. Promise-backed bootstrap sources keep the existing loading behavior.

@freddymeta
