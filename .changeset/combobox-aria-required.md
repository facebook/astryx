---
'@astryxdesign/core': patch
---

[fix] `Typeahead` and `Tokenizer` expose their state on the combobox: `aria-required` for a required field, including under `FormLayout defaultOptionality="required"` where the visible marker is hidden, and `aria-invalid` for an error status. Screen readers now announce these fields as required and as invalid.

@cixzhang @duytbp
