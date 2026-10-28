---
'@astryxdesign/core': patch
---

[fix] Tokenizer forwards `cancel` to its `searchSource`, so a newer search, closing the menu, focus leaving the field, or unmounting cancels the consumer's in-flight search (for example, to abort its request). Previously the Tokenizer wrapped the source to filter selected items and dropped `cancel`, so it was never called.
@hurrymaplelad
