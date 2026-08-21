---
'@astryxdesign/core': patch
---

[fix] Toast: don't apply a media theme the surface can't carry

Toast assumed `--color-background-inverted` is inverted, and applied a dark
media context whenever the page was light. A theme is free to define that
token as a soft grey — and then the toast painted white text on a pale
surface at 1.25:1, with no way to know, because the assumption lived in a
ternary rather than in anything measured.

Toast still asks for the context it wants. That request is now checked against
the colors the browser actually painted, and only overridden when it comes out
unreadable — below 3:1, WCAG's own non-text floor. This is a bug guard, not a
contrast enforcer: a theme that picks a soft-but-legible pairing keeps it, and
every stock Astryx surface keeps the mode it has today.

`MediaTheme` gains `mode="off"` to support it — the same element without the
media attribute, so a correction is a prop change rather than a tree change
and children never remount.

@cixzhang
