---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] AspectRatio: emit `ratio` as a class-level `aspect-ratio: var(--astryx-aspect-ratio, <ratio>)` declaration instead of a hard inline style, so the ratio can be overridden responsively: StyleX consumers pass an `aspect-ratio` rule via `xstyle` (including under `@media`/`@container` conditions) and plain-CSS/Tailwind consumers set the `--astryx-aspect-ratio` custom property from any rule. The mixed-gallery template's hero now switches 3:1 to 3:2 when the grid stacks with a one-line variable override on a single element, the workaround the fixed ratio previously forced with duplicated hero markup (#2798)
@jiunshinn
