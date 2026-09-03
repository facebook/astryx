---
'@astryxdesign/core': patch
---

[fix] Spinner: the drawn frame follows a themed `--spinner-diameter`, so a
themed ring is no longer clipped or off-centre. (#5214)

`--spinner-diameter` and `--spinner-stroke-width` set the ring in CSS, and the
box the ring sits in is composed from those same two vars — but the `<svg>` was
sized and given its `viewBox` in JS, from the size's own constants. Theming the
diameter therefore left the frame behind: the svg stayed at its default while
the box shrank around it, and an overflowing grid item aligns to start rather
than centre. Measured in Chromium across the four sizes, a themed ring rendered
1.5-3.3px off-centre with its far edge cropped.

The svg is now sized in CSS from `--_spinner-box-size` — the same composed var
the span is sized from — with no `viewBox`, so one user unit is one pixel and
the frame moves with the box. (Not a percentage: the span is a grid whose area
is not always definite in both axes, and an unresolved percentage height on an
SVG falls back to the replaced-element default of 150px.) The px `width`/
`height` attributes remain as the no-stylesheet fallback, as `r` and
`stroke-width` already were. Both circles centre on
`cx`/`cy="50%"`, and the arc's twelve-o'clock offset is a CSS rotation about
the shape's own box rather than an SVG transform about a centre in user units.

No change to the default render at any size — same box, ring, stroke and
sweep, verified against a build of `main`. What changes is that the documented
claim "the rendered box … follows automatically" is now true.

@freddymeta
