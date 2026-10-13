---
'@astryxdesign/core': patch
---

[feat] A mouse opens a Selector's list on press and can drag straight into it.

A `Selector` trigger now opens its list on a mouse press-down, and a drag
from the trigger into the list that lets go over an option picks it, as a
native pop-up button does. The release of the opening press acts only after
the pointer has entered the list or the press has lasted about a third of a
second, so a list that opens with its selected row under the pointer never
picks an option nobody chose. Pressing the trigger of an open list closes it
without reopening in the same gesture. A tap still opens through its click,
and a held finger opens nothing. A caller's `onPointerDown` on the trigger
runs first and may prevent the press-open. `useCombobox` (internal) gains
`open`.

@vjeux
