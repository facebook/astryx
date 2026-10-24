---
'@astryxdesign/core': patch
---

[feat] A mouse opens a Selector's list on press and can drag straight into it.

A `Selector` trigger in the popover presentation now opens its list on a
mouse press-down, and a drag from the trigger into the list that lets go over
an option picks it, as a native pop-up button does. The release of the
opening press acts only after the pointer has entered the list or the press
has lasted about a third of a second, and the row the list places under the
pointer (the selected option, the first, or another where the viewport
clamped the list) is never picked by that release
unless the pointer visited another row first or, for the selected option,
moved away from the press point; a slow or shaky click leaves the list open.
Pressing the trigger of an open list closes it without reopening in the same
gesture. The bottom sheet, a tap and a held finger keep click-to-open. A
caller's `onPointerDown` on the trigger runs first and may prevent the
press-open.

@vjeux
