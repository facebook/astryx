---
'@astryxdesign/core': patch
---

[feat] `List` gains `editingControl="select"`, a UIKit table's multiple selection during editing: in edit mode each row shows the theme's checkbox indicator in its leading column, checked when the row is `isSelected` (a theme can map the indicator to a circle). The indicator itself is hidden from assistive technology: the row's activation is announced as a checkbox, checked while the row is selected, and stays the row's one tab stop; activating the row calls its `onClick` as before, for the app to toggle the row's selection. Its type is exported as `ListEditingControl`. Under a finger (iOS and Android alike) the control slides in with the rows and fades in on UIKit's table spring, and slides out on leaving; with reduced motion on it cross-fades; with a mouse it comes and goes at once.

@vjeux
