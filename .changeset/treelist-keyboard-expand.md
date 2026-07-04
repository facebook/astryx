---
'@astryxdesign/core': patch
---

[fix] TreeList: parent rows can now be expanded and collapsed from the keyboard. Any item with children renders a real focusable toggle button with `aria-expanded`, so expansion no longer requires a mouse — previously items without an `onClick`/`href` had no focusable control at all (#3343).
@cixzhang
