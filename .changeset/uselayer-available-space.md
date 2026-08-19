---
'@astryxdesign/core': patch
---

[feat] useLayer: size a layer to the space its anchor leaves it

A layer that does not fit could only move. `position-try-fallbacks` flips it
to the opposite side and slides it along the alignment axis, but nothing ever
sizes it, so a layer carrying a long list in a short viewport runs off the
screen at its full height however it is placed. Layer-bearing components work
around this with a fixed cap, which amputates the list on a tall window and
still overflows on a short one — and caps nothing on the inline axis.

`clampToAvailableSpace: 'block' | 'inline' | 'both'` on the render props holds
the layer inside the room that is actually there. `position-area` already
makes the anchor's cell the layer's containing block, so `100%` along an axis
is that distance: the clamp is pure CSS, with no measurement, no observers and
no extra render pass, and it re-resolves wherever a fallback puts the layer.
It is a maximum, so short content keeps its natural size.

The number was reachable before this — `style` merges last, so the same
declarations by hand clamp identically. What they get wrong is the two things
this prop carries with them. The fallbacks are ordered by size on the
placement axis, because a clamped layer always fits and the browser would
otherwise stop flipping and keep the first side however cramped: 172px of room
taken below while 300px sat free above. And the layer becomes a flex column
only while open, so content can size against the clamp without an inline
`display` overriding the closed-popover rule and painting a shut layer. Give
that content `maxBlockSize: '100%'` and its own `overflow` to scroll it.

Off by default, and ignored under `positioning: 'custom'`, which has no cell
to measure against.

@cixzhang
