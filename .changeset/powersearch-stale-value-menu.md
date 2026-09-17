---
'@astryxdesign/core': patch
---

[fix] PowerSearch: switching the field or operator while a value menu is open now replaces the menu's contents instead of leaving the previous field's options showing. The value editor is keyed on the field and operator it edits, so editors for two fields sharing a value type no longer share one instance; nested sub-filter rows get the same treatment. BaseTypeahead also invalidates in-flight searches when its `searchSource` is replaced, so a late response from the old source can no longer populate the menu.

@nynexman4464
