---
'@astryxdesign/core': patch
---

[fix] Keep `useTableColumnResize` handles reachable by keyboard on touch-first devices (#6194)
@ernestt

The handles were hidden outright wherever the primary pointer is coarse. That
removed the separator from the accessibility tree along with the pointer
target, so a tablet with a keyboard attached lost column resize entirely —
while the plugin's keyboard path, accessible name, and value bounds all went on
promising it.

Pointer capability now gates the reveal rather than the control. The handle
stays rendered and focusable wherever any input can drive it, and coarse
pointers instead get `pointer-events: none`: dragging a hairline boundary by
finger is not a supported path, and an invisible 8px strip that swallows
touches on the header is worse than no target at all.
