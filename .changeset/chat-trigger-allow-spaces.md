---
'@astryxdesign/core': patch
---

[feat] Chat: mention people and topics by multi-word names with opt-in `hasMultiWordQuery` on `ChatComposerTrigger`

Set `hasMultiWordQuery: true` on a trigger whose suggestions contain spaces, and typing `@Jordan Le` keeps narrowing the menu instead of closing it at the first space. The query runs until a line break or about 64 characters, typed text is never changed unless a row is picked, and an unmatched multi-word phrase hides the menu unless the trigger sets `emptySearchText`. Triggers that don't opt in still end their query at a space.

For every trigger: Enter does nothing while results for the current query are still loading, so a half-typed mention is never sent and a row from an earlier query is never picked. Results that arrive after the query ends are dropped, Escape and the arrow keys pass through while the menu is hidden, and IME keystrokes never pick a row.

@Geervan
