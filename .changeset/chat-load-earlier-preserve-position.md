---
'@astryxdesign/core': patch
---

[fix] ChatMessageList keeps the reader's position when scrollToTopAction prepends earlier messages, runs one load at a time, and no longer reconnects its top sentinel observer when the action prop identity changes

@AKnassa
