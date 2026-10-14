---
'@astryxdesign/core': minor
---

[breaking] `reset.css`'s box model now reaches `::backdrop`, the layer behind a modal dialog, a popover or a fullscreen element. Like every element, `::before` and `::after`, a backdrop is now `box-sizing: border-box` with a `0 solid currentColor` border. A backdrop that sets `width` or `height` together with padding or a border now includes them in that size; setting only `border-width` now draws a solid border, and setting only `border-style` draws nothing until a width is set.

To keep the old result, set `box-sizing: content-box`, or the full `border` you want, on your `::backdrop`. There is no codemod: whether a stylesheet relies on the old box cannot be read from its source.

@vjeux
