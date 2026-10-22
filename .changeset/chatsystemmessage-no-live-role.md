---
'@astryxdesign/core': patch
---

[fix] `ChatSystemMessage` no longer forces `role="status"` on its root, in either variant, so a screen-reader user hears a new chat notice once, from the chat log, instead of from both the `ChatMessageList` log and the notice (WCAG 2.2 SC 4.1.3 Status Messages; `spec:AST-086` FR1 and FR4). Date and divider rows are no longer presented as status messages. Before, every system message was a status region inside the list's polite log; now the log owns content added inside it, and a `role` passed to the component reaches its root. Tests that found a system message by the `status` role should query it by its text instead.

@cixzhang
