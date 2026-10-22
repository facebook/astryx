---
'@astryxdesign/core': patch
---

[fix] Tokenizer: once a field has tokens, its text cursor sits right after the last token, on the last row where typed text starts, instead of at the end of the first row. PowerSearch gets the same fix. When the last row has no room left for the cursor, focusing starts a new row for it; at rest the field keeps its height.
@kentonquatman
