---
'@astryxdesign/core': patch
---

[fix] Table: the sort control and the filter trigger are now the real `Button`
and `IconButton` instead of native buttons that restated their interaction
states. Rest, hover, pressed, the focus ring, the press transform and the
reduced-motion guard all come from Button now, so they cannot drift from it.
Visible consequences: both controls take Button's hover and pressed overlay
(`--color-overlay-hover` / `--color-overlay-pressed`, drawn as a background
image rather than a background colour) and its `scale(0.98)` press; the filter
trigger, which previously fell through to the user agent's default outline on
keyboard focus, draws the shared 2px ring; the filter trigger's box is Button's
`sm` square (28x28 measured, above the 24px WCAG 2.2 2.5.8 minimum) instead of a
bare icon. The column heading inside the sort control is unchanged: measured
against its `<th>`, colour, white-space, overflow, text-overflow, font size and
weight all match.

[fix] Table: the resting sort arrows and filter funnel are no longer dimmed to
`opacity: 0.35`. Composited against the header that put them at **1.57:1**,
below the 3:1 [WCAG
1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) asks
of a UI component; they render at `--color-icon-secondary`, measured 4.74:1.
Both affordances stay visible at rest rather than fading in on header hover. The
sorted arrow still moves to the accent colour and still changes glyph
(`arrowsUpDown` -> `arrowUp`/`arrowDown`) alongside the `aria-sort` the header
already carries, so the state is never colour alone. The glyph darkens a step on
hover so the feedback survives a forced-colors mode that drops backgrounds, and
hover is guarded on `@media (hover: hover)` so a touch device does not stick in
it after a tap.

[feat] Table: `astryx-table-sort-button` (reflecting `direction`) and
`astryx-table-filter-button` (reflecting `active`) are stable theme targets.
Both controls are rendered inside Table's own plugins, so there is no wrapper a
consumer can interpose and no `renderX` prop to route around: restyling either
meant `.astryx-table-header-cell button[aria-haspopup='dialog']`, a selector
that says "the button that opens a dialog", which is the filtering funnel today
and could be anything tomorrow.

`color` on `astryx-table-sort-button` paints the sort glyph and leaves the
column name alone. The control holds both, and the name belongs to the header
cell, so the value is routed to the glyph through the derived-var registry and
the source property is dropped — the same mechanism Progress bar marks and Text
area padding already use. `color` on `astryx-table-filter-button` reaches the
funnel directly, since that control holds nothing else.

@freddymeta
