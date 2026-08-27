---
'@astryxdesign/core': patch
---

[fix] Card: reflect `elevation` as a theme target so a theme can reach it, and correct the documented `padding` default

`elevation` picked a style object but never reached the DOM, so `astryx-card` exposed `data-variant` and nothing for elevation and a theme could not style the four shadow tiers. It now rides `themeProps` alongside `variant`.

The `padding` prop documented `4` as its default. With the prop omitted the card reads the theme's card padding, and most shipped themes set that to a different step, so writing the documented default explicitly changed the card's size. The prop docs, the JSDoc and the playground default now say that omitting the prop takes the theme's padding and passing a step overrides it. The four `effectivePadding !== 4` style branches that encoded the same wrong default in code are gone: `container()` already sets every variable they set, verified identical across all eleven padding steps on both a bordered and a borderless card.

@cixzhang
