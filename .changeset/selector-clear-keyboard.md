---
'@astryxdesign/core': patch
---

[fix] Selector/MultiSelector: `Delete` and `Backspace` now clear the value from the focused trigger when `hasClear` is set, so clearing a selection is no longer mouse-only. The clear button was already keyboard-reachable; this adds the keyboard shortcut path (#3343).
@cixzhang
