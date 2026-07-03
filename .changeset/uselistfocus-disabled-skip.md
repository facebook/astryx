---
'@astryxdesign/core': patch
---

[fix] useListFocus (menu/toolbar keyboard navigation): arrow keys, Home, and End now skip disabled items instead of stalling on one whose `.focus()` silently no-ops. This unfreezes keyboard navigation in NavHeadingMenu and Toolbar/ButtonGroup when a disabled control is present. The default item selector also now matches `menuitemradio`/`menuitemcheckbox` (#3343).
@cixzhang
