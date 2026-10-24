---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] On an iPhone or iPad (WebKit on iOS under a finger), a `TreeList` row's children slide out from under it as it expands, with the rows below moving down alongside and the chevron turning, and slide back under it as it collapses, as in an iOS outline list. They used to appear and vanish in a single frame. The motion runs on the compositor and keeps going while the page runs script. Other touch screens and lists driven by a mouse are unchanged. The outline spring, and the spring of a list's row updates, are motion roles a theme can retune (`list.update.outlineSpring`, `list.update.tableSpring`, carried by `--motion-list-update-outline-spring` and `--motion-list-update-table-spring`), and `astryx docs motion` lists them.

@vjeux
