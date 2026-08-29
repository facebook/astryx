---
'@astryxdesign/core': patch
---

[fix] Chat/useChatStreamScroll: an upward wheel or a touch drag releases auto-follow in both motion modes, and a gesture this scroller never consumed no longer releases it at all. The gesture handlers stopped gating on the spring being live: they now vouch for the scroll they produce, waiving the synthetic-resize guard so `onScroll`'s direction check still sees the reader's intent while content is arriving. `jumpToBottom` also carries a generation token, so cancelling an in-flight spring is real and animation loops cannot stack. (#5662, #5663)
@yyq1025
