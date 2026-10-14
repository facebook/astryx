---
'@astryxdesign/core': patch
---

[fix] `Typeahead`, `Tokenizer`, and `PowerSearch`: focusing an empty field with `hasEntriesOnFocus` after its search source changed now bootstraps entries from the new source. Previously the results cached from the old source were already invalidated but still blocked the bootstrap, so focusing or clicking into the field opened nothing until the user typed. Cached results that are still current are re-shown without a new bootstrap, as before.

@imdreamrunner
