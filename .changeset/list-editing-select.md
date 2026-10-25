---
'@astryxdesign/core': patch
---

[feat] `List` gains `editingControl="select"`, a UIKit table's multiple selection during editing: in edit mode each row shows the theme's checkbox indicator in its leading column, checked when the row is `isSelected` (a theme can map the indicator to a circle). It is decorative: the row keeps its selected semantics and its one tab stop, and activating the row calls its `onClick` as before, for the app to toggle the row's selection. Under a finger (iOS and Android alike) the control slides in with the rows and fades in on UIKit's table spring, and slides out on leaving; with reduced motion on it cross-fades; with a mouse it comes and goes at once.

@vjeux
