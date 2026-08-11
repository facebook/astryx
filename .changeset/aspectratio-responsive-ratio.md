---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] AspectRatio: emit `ratio` as a class-level declaration instead of a hard inline style, so the ratio can be overridden responsively: StyleX consumers pass an `aspect-ratio` rule via `xstyle` (including under `@media`/`@container` conditions), and plain-CSS/Tailwind consumers override `aspect-ratio` from their own unlayered rules, which beat the `astryx-base` cascade layer regardless of specificity. The mixed-gallery template's hero now switches 3:1 to 3:2 when the grid stacks with a one-line override on a single element, replacing the duplicated hero markup the fixed inline ratio previously forced (#2798)
@jiunshinn
