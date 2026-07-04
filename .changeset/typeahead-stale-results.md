---
'@astryxdesign/core': patch
---

[fix] Typeahead/Tokenizer discard out-of-order async search results (#3587)

Each search now claims a new generation, so a slow response for an abandoned query can no longer overwrite the results of the current one (previously the last response to resolve always won, and Enter could select an item from a query the user had already replaced).
@arham766
