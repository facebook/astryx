---
'@astryxdesign/core': patch
---

[feat] `ComplexSelector` can hang off a control the caller renders.

A new `renderTrigger` render prop renders the control the popup hangs off — a glyph
in a list row, a chip, an icon button — in place of the selector's own field
and button. Spread the given props onto it; the popup is anchored to it, keeps
its dialog label from `label`, opens on click or ArrowDown, and returns focus
to the control on close. The existing `handleRef` and `onOpenChange` work
unchanged beside it. Off by default; existing selectors are unchanged.

@vjeux @cixzhang
