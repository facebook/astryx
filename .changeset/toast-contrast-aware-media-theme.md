---
'@astryxdesign/core': patch
---

[feat] Toast: apply media theming only when the surface actually needs it

Toast assumed `--color-background-inverted` is inverted, and applied a dark
media context whenever the page was light. A theme is free to define that
token as something barely inverted — and then the toast painted white text on
a pale surface at 1.25:1.

Toast now measures what the browser painted: the surface's composited
backdrop, and `--color-text-primary`, the token its children render with. When
that pairing is already comfortable, no media theme is applied; when it is
short, whichever of `--color-on-dark` / `--color-on-light` scores better wins.
Every stock Astryx surface keeps the mode it has today.

Two new pieces of public API support it:

- `MediaTheme` accepts `mode="off"` — the same element, without the media
  attribute, so a surface can drop the inversion without remounting children.
- `useContrastMode(ref)` returns the mode a surface should use, plus the
  measurement behind it. The bar defaults to 7:1 rather than the 4.5 AA line:
  a media context carries interaction overlays, borders and accent as well as
  text color, so a surface should only skip it when the pairing is
  comfortable, not merely passing.

@cixzhang
