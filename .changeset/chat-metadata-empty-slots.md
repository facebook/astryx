---
'@astryxdesign/core': patch
---

[fix] Omit empty ChatMessageMetadata slots and their separators.

Boolean and empty-string timestamp or footer values no longer leave a blank row
or a stray dot. Numeric zero remains visible, and all delivery statuses keep
their existing labels and icons.

@cixzhang
