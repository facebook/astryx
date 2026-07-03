---
'@astryxdesign/core': patch
---

[fix] ChatMessageList: add an `isStreaming` prop that marks the `role="log"` region `aria-busy` while an assistant message streams in. Previously the polite live region re-announced the accumulating partial text on every token; with `isStreaming` set for the duration of a stream, screen readers wait and announce the completed message once (#3343).
@cixzhang
