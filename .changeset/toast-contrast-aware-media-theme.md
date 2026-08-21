---
'@astryxdesign/core': patch
---

[feat] MediaTheme: add `mode="auto"` and `mode="off"`

A theme is free to define `--color-background-inverted` as something that is
not inverted — and a component that hardcodes `mode="dark"` then paints white
text on pale grey at 1.25:1. The surface color is a runtime value and the mode
was a compile-time guess, so no amount of care in the component could catch
it.

`mode="auto"` measures the surface the browser actually painted and applies
whichever of the theme's own `--color-on-dark` / `--color-on-light` reads
better on it. There is no threshold and no contrast target: it picks between
the theme's two answers, so a theme that wants a soft pairing still gets one.
Deciding a surface needs _no_ media context stays an authoring choice —
that is the new `mode="off"`, which renders the same element without the media
attribute so children never remount.

When the backdrop is not knowable from CSS — during SSR, on the first client
frame, and most often behind a `background-image`, whose pixels need sampling
(see `useImageMode`) rather than a computed style — `auto` uses the new
`fallback` prop instead of guessing.

Toast now uses `mode="auto"`, with its previous rule kept only as that
fallback. Every stock Astryx surface renders exactly as before.

@cixzhang
