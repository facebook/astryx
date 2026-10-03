---
'@astryxdesign/core': patch
---

[feat] A mouse opens a DropdownMenu on press and can drag straight into it; a finger held on the trigger opens it with the finger down.

A `DropdownMenu` trigger now opens its menu on a mouse press-down, and a
drag from the trigger into the menu that lets go over a row picks it, as
macOS menus do. The release of the opening press acts only after the
pointer has entered the menu or the press has lasted about a third of a
second, so a menu that opens under the pointer never picks a row nobody
chose. Pressing the trigger of an open menu closes it without reopening in
the same gesture. A tap still opens through its click; a finger held on the
trigger for half a second opens the menu with the finger down, and a slide
then picks. `useMenuPress` gains `onTriggerPress`, `triggerProps`,
`isTriggerClickFromPress` and `longPressDelayMs`.

@vjeux
