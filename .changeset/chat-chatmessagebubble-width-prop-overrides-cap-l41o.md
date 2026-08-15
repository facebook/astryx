---
'@astryxdesign/core': patch
---

[feat] Chat: ChatMessageBubble accepts a `width` prop (numbers are pixels, strings pass through, e.g. `width="100%"`), following the sizing convention on Card and other containers. When set it replaces the bubble's default `max(80%, 280px)` width cap; when unset nothing changes. Combined with `variant="ghost"`, custom in-message content (an artifact card, attachment chips, a standalone ChatMessageMetadata) can now align with the bubble's text column at the full message-column width — previously the only workaround was hardcoding the bubble's private padding token at every call site. (#2574)
@jiunshinn
