---
'@astryxdesign/core': patch
---

[fix] Typeahead: clearing the value while editing it now empties the input and reports `onChangeQuery('')`, instead of leaving the old label in a field with no value. Fixes #7038.

@HelloOjasMutreja
