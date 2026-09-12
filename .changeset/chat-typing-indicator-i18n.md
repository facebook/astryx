---
'@astryxdesign/core': patch
---

[fix] Adds the `@astryx.chatTypingIndicator.*` catalog keys so the lab ChatTypingIndicator can build its typing status from the translation runtime instead of English literals, joining names with `Intl.ListFormat` for the active locale. English output is unchanged.

@Kyujenius
