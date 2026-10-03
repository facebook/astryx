---
'@astryxdesign/core': patch
---

[feat] `MultiSelector` can hang off a control the caller renders.

A new `renderTrigger` render prop renders the control the panel hangs off — a glyph
in a list row, a chip, an icon button — in place of the selector's own field
and button. Spread the given props onto it; the listbox is anchored to it,
named by `label`, takes focus on open, and focus returns to the control on
close. `handleRef` (`open`/`close`/`toggle`/`isOpen`, the `ComplexSelectorHandle`
shape) and `onOpenChange` let the caller open the panel from a keystroke
elsewhere and observe every open and close. All three are off by default;
existing selectors are unchanged.

@vjeux @cixzhang
