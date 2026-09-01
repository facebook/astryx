---
'@astryxdesign/core': patch
---

[feat] Banner: the header's supporting line now carries a stable theme target, `astryx-banner-description`. Only the header, the status icon and the content panel were themeable before, so a theme restyling the description — its colour, its type, or the space between it and the title — had to reach in with a structural selector like `.astryx-banner > div:nth-child(2) > div:nth-child(2)`. Purely additive: no existing class, data attribute, or style changes.

Nothing else in the header becomes a target. The end area is a layout row — flex, wrap, and the edge compensation that lets its buttons overhang the header padding — not a painted surface, and a theme that wants the header to grow around its buttons instead of letting them overhang sets `padding-block` on the existing `banner` target, which reaches the same height without exposing a private margin. The title, the two controls and the text column are likewise left alone: the column paints nothing (`display: flex; flex-direction: column; gap: 0`) and the space it owns is expressible on `banner-description`, while the title and the controls already render the way the consuming theme wants them.

@freddymeta
