---
'@astryxdesign/core': patch
---

[feat] Drawer is a container, like Dialog. A new `padding` prop takes a spacing step, and a theme's `padding` on `drawer` pads the drawer's scrolling content area through container tokens instead of padding the panel. The padded content area publishes its inset, so a Section that is the drawer's only child, and bleed children such as Table and Divider, align against it, and a Layout inside picks the value up for its header, content, and footer regions. With neither set, the content area stays unpadded as before, and the block-end safe-area inset is preserved in every mode.

@imdreamrunner
