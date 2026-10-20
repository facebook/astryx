---
'@astryxdesign/core': patch
---

[feat] `reset.css`'s box model now reaches `::backdrop`, the layer behind a modal dialog, a popover or a fullscreen element. A backdrop was `content-box` with no border style; like every element and `::before`/`::after`, it is now `border-box` with a `0 solid currentColor` border. Astryx's own backdrops look the same. A backdrop that sets `width` or `height` with padding or a border now includes them in that size, and one that sets only `border-width` now draws a solid border in its text color.

To keep the old look, add `::backdrop { box-sizing: content-box; border-style: none; }`.

@vjeux
