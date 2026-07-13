---
'@astryxdesign/core': patch
---

[fix] Chat components forward pass-through props (data-_, aria-_, id) to the DOM

`ChatDictationButton`, `ChatLayoutScrollButton`, `ChatMessageMetadata`,
`ChatSystemMessage`, and `ChatTokenizedText` declared `BaseProps` but silently
dropped `data-*`, `aria-*`, and `id`: they never captured `...rest` nor spread
it onto their rendered element. They now capture `...rest` and spread it onto
their primary element after the merged className/style, with any
component-owned attribute (e.g. `role`) set afterward so it still wins.

@cixzhang
