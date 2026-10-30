---
'@astryxdesign/core': patch
---

[fix] Typeahead and Tokenizer hide the previous empty-result row while the next query debounces or waits for its answer. The existing input spinner provides loading feedback; no replacement Loading row is added. Settled empty results and their announcements remain unchanged. Fixes #8903.
@nynexman4464
