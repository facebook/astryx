---
'@astryxdesign/core': patch
---

[fix] ChatSendButton now forwards `className`, `style`, and pass-through attributes (`data-*`, `aria-*`, and other rest props) to the rendered button. Previously these were silently dropped. (#4190)
@cixzhang
