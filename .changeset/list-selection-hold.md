---
'@astryxdesign/core': patch
---

[feat] A list row tapped to push can stay selected while the pushed screen covers it, then deselect as the screen pops, as a UIKit table row does. `holdSelection(event.target)` from `@astryxdesign/core/utils` holds the `ListItem`, `Item` or `TreeList` row under an activation and returns a handle a navigation drives: `animate(1)` runs UIKit's in-transition deselect, `setProgress` follows an interactive pop, `end(false)` selects the row again after a cancelled pop, and `focus()` returns focus to the row. The deselect runs on the compositor. A divided list keeps the dividers around the held row hidden.

@vjeux
