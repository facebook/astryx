---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] Under a finger, a list row tapped to push can stay selected while the pushed screen covers it, then deselect as the screen pops, as a UIKit table row does; with a mouse the hold is null and the press releases at the lift as before. `holdSelection(event.target)` from `@astryxdesign/core/utils` holds the `ListItem`, `Item` or `TreeList` row under an activation and returns a handle a navigation drives: `animate(1)` runs UIKit's in-transition deselect, `setProgress` follows an interactive pop, `end(false)` selects the row again after a cancelled pop, and `focus()` returns focus to the row, with a keyboard focus ring only when the user last used a keyboard. The deselect runs on the compositor. A divided list keeps the dividers around the held row hidden. The deselect's clock and curve are motion roles a theme can retune (`list.deselect.navigationPopMs`, `list.deselect.navigationPopCurve`, carried by `--motion-list-deselect-navigation-pop-ms` and `--motion-list-deselect-navigation-pop-curve`), and `astryx docs motion` lists them.

@vjeux
