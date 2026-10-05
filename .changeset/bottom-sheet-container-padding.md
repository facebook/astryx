---
'@astryxdesign/core': patch
---

[feat] BottomSheet is a container, like Dialog. A new `padding` prop takes a spacing step, and a theme's `padding` on `bottom-sheet` now pads the sheet's content box through container tokens instead of padding the panel. The padded content box publishes its inset, so a Section that is the sheet's only child, and bleed children such as Table and Divider, align against it. With neither set, the content box stays unpadded as before.

@imdreamrunner
