---
'@astryxdesign/core': patch
---

[fix] Tokenizer: suppress the "Create" option for already-selected tokens whose id differs from their label. Tokenizer compared typed text against selected token IDs instead of labels, which caused the menu to offer a duplicate "Create" entry for selected tokens whenever id !== label, and allowed committing duplicate labels. (#6366)

@onlyysaurabh
