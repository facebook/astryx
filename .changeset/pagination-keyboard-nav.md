---
'@astryxdesign/core': patch
---

[feat] Pagination: the `dots` variant is now keyboard navigable via the shared useListFocus primitive. With a dot focused, Left/Right arrows move between dots and Home/End jump to the first/last, the active page follows focus (roving tabindex), and Up/Down are left to the browser so vertical scrolling is unaffected. (#3681)
@bhamodi
