---
'@astryxdesign/core': patch
---

[feat] Chat: control how the first fill is positioned. `ChatLayout` gains an `initial` prop (`'spring' | 'instant' | false`) — `'instant'` opens an existing conversation at the latest message with no animation (history, replay, session switching), `false` starts at the top with follow disengaged for reading-oriented surfaces, and `'spring'` keeps today's behavior. `useChatStreamScroll` gains the same `initial` option plus `scrollToBottom({instant: true})` for one-frame programmatic jumps. Exports `ChatScrollInitial` and `ChatScrollToBottomOptions` types. (#3795)
@yyq1025
