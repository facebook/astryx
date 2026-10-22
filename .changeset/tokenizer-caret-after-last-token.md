---
'@astryxdesign/core': patch
---

[fix] Tokenizer: once a field has tokens, its text cursor sits right after the last token, on the last row, instead of at the end of the first row. PowerSearch gets the same fix. When the last row is too full for the cursor, focusing starts a new row for it; when it fits the cursor but not the typing area, the first keystroke moves to a new row. At rest the field keeps its height.
@kentonquatman
