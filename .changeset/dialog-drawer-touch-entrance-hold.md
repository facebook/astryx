---
'@astryxdesign/core': patch
---

[fix] Under a finger, a tap or a drag that lands while a `Dialog` or a `Drawer` is still entering no longer closes it, runs one of its actions, moves focus or scrolls the page: it reaches nothing until the entrance has played, and the dialog or drawer finishes entering and stays open. Keys and assistive technology stay live during the entrance, the content stays in the accessibility tree, a pinch still zooms the page, and a mouse is unchanged.

@vjeux
