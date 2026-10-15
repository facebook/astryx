---
'@astryxdesign/core': patch
---

[feat] `List`: add `edge` to choose where each row's text, dividers, and hover and selection backgrounds sit. `padded` (default) keeps today's look. `flush` drops the rows' side padding, so text and dividers start on the same line as the list header and a heading above, with no container needed. `outset` keeps backgrounds' room around the text while reaching into the padding of a Card, Section, or Dialog, so text lands on the heading's line. `bleed` reaches rows to the container's edges with square corners, like Table rows in a Card. `edgeCompensation="inline"` is deprecated in favor of `edge="outset"` and keeps working; its rows' outer room is no longer cut off by the list's swipe clip. Run `astryx upgrade` to rename it.

@kentonquatman
