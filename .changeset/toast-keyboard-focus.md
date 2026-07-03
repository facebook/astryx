---
'@astryxdesign/core': patch
---

[fix] Toast: keyboard users can now reach and manage notifications. Pressing `F6` jumps focus into the toast viewport (the newest toast's first control, or the container). Dismissing a toast that holds focus now hands focus to a remaining toast — or restores the element focused before entering the viewport — instead of dropping to `<body>`. Auto-hide timers also pause while the window is blurred and resume on focus, so a toast no longer silently expires while you're in another window or tab (#3343)
@cixzhang
