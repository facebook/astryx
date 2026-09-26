---
'@astryxdesign/core': patch
---

[fix] Compose accepted `onClick` handlers with ChatSendButton's send and stop actions instead of replacing them (#6653). Consumers that used `onClick` to replace sending should move that logic to `onSend`, because both handlers now run.

@cixzhang
