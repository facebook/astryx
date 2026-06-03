---
'@xds/core': patch
---

`XDSChatComposerInput`: preserve the caret when the parent updates the controlled `value`. Previously the controlled-value sync effect wrote `textContent = value` on every change, which collapsed the caret to offset 0 — visible after a slash-command pick like `setValue('/feedback ')`, where the next keystroke landed at the start of the input. The effect now skips echoes of its own emission (no redundant DOM rebuild) and restores the caret to the end of the new content when the editable is focused.
