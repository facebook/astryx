---
'@astryxdesign/core': patch
---

[fix] Chat: a token in a message bubble now sits on the line the way it does in the composer. `ChatTokenizedText` wraps each token in the same `inline-flex` / `vertical-align: middle` box `ChatComposerInput` uses, so a chip stops lifting off the text the moment the message is sent. Follows #5324, which fixed the composer half (#5402).

@cixzhang
