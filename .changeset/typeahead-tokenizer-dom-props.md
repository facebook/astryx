---
'@astryxdesign/core': patch
---

[fix] Forward accepted DOM props such as `id`, `data-*`, and `onClick` to the Typeahead and Tokenizer root elements. Preserve existing ref, styling, and `data-testid` targets and Typeahead's built-in focus and edit behavior inside InputGroup.
@korkt-kim
