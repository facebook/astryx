---
'@astryxdesign/core': patch
---

[fix] CodeBlock: restart the copied-indicator timer on rapid re-copy

Each copy click armed an independent 2s reset timer, so copying again within the window let the first click's timer revert the "Copied" indicator early. The timer now restarts on every copy and is cleared on unmount.
@arham766
