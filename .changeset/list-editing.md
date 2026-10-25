---
'@astryxdesign/core': patch
---

[feat] `List` gains `isEditing`, a UIKit table's edit mode: every row makes room at its leading edge for an editing control, as UIKit indents a row in edit mode whatever its editing style, and its trailing content (`endContent`) leaves, as a table cell's accessory does. Under a finger (iOS and Android alike), entering and leaving animate on UIKit's table spring: the rows' content slides by the indent from where it was and the trailing content fades out in place, and a toggle mid-transition turns around from where it is. With reduced motion on, nothing slides: the change cross-fades. With a mouse the list switches at once. Off by default.

@vjeux
