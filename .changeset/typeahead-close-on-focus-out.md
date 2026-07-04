---
'@astryxdesign/core': patch
---

[fix] Typeahead/Tokenizer: close the results dropdown when focus leaves the input (e.g. tabbing away), matching the existing outside-click and Escape dismissal. Previously the menu could stay open after the trigger lost focus.

@cixzhang
