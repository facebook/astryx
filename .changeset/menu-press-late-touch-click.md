---
'@astryxdesign/core': patch
---

[fix] After a finger's tap in a DropdownMenu (and every other menu on the press model), the browser's own click for that tap is swallowed even when a busy main thread holds it past the 400 ms window, up to 2 s. Before, after a tap that drilled into a sub-menu, such a late click picked the sub-menu row that had come under the finger and closed the menu. A mouse or pen release keeps the 400 ms window.

@vjeux
