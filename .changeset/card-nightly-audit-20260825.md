---
'@astryxdesign/core': patch
---

[fix] Card: reflect `elevation` as a theme target so a theme can reach it, and correct the documented `padding` default

`elevation` picked a style object but never reached the DOM, so `astryx-card` exposed `data-variant` and nothing for elevation and a theme could not style the four shadow tiers. It now rides `themeProps` alongside `variant`.

The `padding` prop documented `4` as its default. With the prop omitted the card reads the theme's card padding, which every shipped theme but `butter` sets to spacing step 3, so writing the documented default explicitly made the card wider. The prop docs, the JSDoc and the playground default now say what actually happens.

@cixzhang
