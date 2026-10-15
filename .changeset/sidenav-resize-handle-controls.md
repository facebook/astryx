---
'@astryxdesign/core': patch
---

[fix] `SideNav`: the resize handle now names the navigation pane it resizes with `aria-controls` (the nav gets a generated id when the consumer gives none), as the APG window splitter pattern requires, so assistive technology can relate the separator to the pane.

@cixzhang
