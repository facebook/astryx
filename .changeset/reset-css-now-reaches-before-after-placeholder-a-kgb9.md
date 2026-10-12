---
'@astryxdesign/core': minor
---

[breaking] `reset.css` now reaches `::before`, `::after`, `::placeholder` and the search field's cancel button, as its comments document. Three of its rules wrote the pseudo-element inside `:where()`, where pseudo-elements are invalid, so browsers dropped those parts of the selector and the rules never applied to them. Each pseudo-element now follows the `:where()`, as in `:where(*)::before`, and the rules stay in `@layer reset`, so any later layer or unlayered style still overrides them. (#7355)

What changes on a page that loads the reset: a `::before` or `::after` with padding or a border used to size as `content-box` and now sizes as `border-box`; setting only `border-width` on one used to draw nothing and now draws a solid `currentColor` border; a placeholder with no color of its own used to show the browser's grey and now shows `--color-text-secondary` (or that token's own default, `light-dark(#4E606F, #AAAFB5)`, when no Astryx CSS defines it); and a `type="search"` field no longer shows the browser's cancel button.

To keep the old result for one of your own elements, set it in your own CSS: `box-sizing: content-box` or `border-style: none` on the pseudo-element, a `color` on the `::placeholder`, or `appearance: auto` on the field's `::-webkit-search-cancel-button`. There is no codemod: whether a stylesheet relied on the old result cannot be read from its source.

@vjeux
