---
'@astryxdesign/core': patch
---

[feat] On iPhone and iPad, closing a ContextMenu opened by a held finger now follows iOS 26. The menu shrinks back into the finger as it fades, its content blurring out, and the lifted copy returns to the trigger on the same spring it came in on while its shadow and the backdrop clear. A close while the menu is still growing shrinks it back from where it is, with no jump to its full size. A press that lands on the fading backdrop opens nothing and reaches nothing under it, even when it is held past the end of the close.

@vjeux
