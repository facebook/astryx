---
'@astryxdesign/core': patch
---

[feat] A mouse opens a Selector's list on press and can drag straight into it.

A mouse press on a `Selector` trigger's value, in the popover presentation,
now opens its list on press-down, and a drag from there into the list that
lets go over an option picks it, as a native pop-up button does. The chevron
and padding open the list at the click, as before. The release of the
opening press acts only after the pointer has entered the list or the press
has lasted about a third of a second: a quick click that drifts off the
trigger onto the field leaves the list open, as the click did, and a settled
release outside the list closes it, as a mouse released outside does; and the row the list places under the
pointer (the selected option, the first, or another where the viewport
clamped the list) is never picked by that release
unless the pointer visited another row first or, for the selected option,
moved away from the press point; a slow or shaky click leaves the list open.
Pressing the trigger of an open list closes it, clearing the highlight as a
click does, without reopening in the same gesture. A caller's `onClick` runs
once for the press that opens or closes the list, with that press, before it
does. The
bottom sheet, a tap and a held finger keep click-to-open. A caller's
`onPointerDown` on the trigger runs first and may prevent the press-open.

@vjeux
