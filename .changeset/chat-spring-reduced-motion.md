---
'@astryxdesign/core': patch
---

[fix] Chat/useChatStreamScroll: the scroll-follow spring now respects `prefers-reduced-motion` — locked following, `scrollToBottom()`, and `lock()` fall back to the existing instant jump, so the transcript still tracks the bottom without animated travel. Follow-up promised in #3800.
@yyq1025
