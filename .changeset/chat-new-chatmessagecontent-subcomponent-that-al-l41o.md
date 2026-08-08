---
'@astryxdesign/core': patch
---

[feat] Chat: new ChatMessageContent subcomponent that aligns custom in-message content (cards, attachments, citations, a standalone ChatMessageMetadata) to the bubble's text column. It applies the same density-aware inline inset the bubble uses for its text and name/metadata slots, and stretches to the full message column so custom content can use the message's full width. Previously non-bubble children rendered flush with the message edge, and the only workaround was hardcoding the bubble's private padding token at every call site. (#2574)
@jiunshinn
