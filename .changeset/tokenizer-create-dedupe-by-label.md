---
'@astryxdesign/core': patch
---

[fix] Stop Tokenizer's `hasCreate` "Create X" entry from offering a label that is already tokenized under a different id. The duplicate check compared the typed text against selected ids, but real selections usually carry an opaque id (`u1` under the label "Alice"), and the search results could not catch the match because they are pre-filtered to remove already-selected items — so typing an existing token's label offered "Create", which committed a second, duplicate token with a new id. The check now also compares against selected labels (case-insensitive), in both the Create entry and the stale-entry commit guard.

@ManoharPaturi
