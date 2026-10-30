---
'@astryxdesign/core': patch
---

[fix] `Typeahead` and `Tokenizer` set `aria-required` on their combobox for a required field, including under `FormLayout defaultOptionality="required"`, where the visible marker is hidden. Screen readers now announce these fields as required.

@cixzhang @duytbp
