---
'@astryxdesign/core': patch
---

[fix] Chat: opening a conversation that already has content (history, replay, session switching) no longer spring-scrolls from the top — the first fill positions instantly, whether the content is present at mount or arrives asynchronously. Subsequent growth (streaming) springs as before. `useChatStreamScroll`'s `scrollToBottom` accepts `{behavior: 'instant'}` for one-frame programmatic jumps, mirroring the DOM's `scrollTo({behavior})`. Exports the `ChatScrollToBottomOptions` type. (#3795)
@yyq1025
