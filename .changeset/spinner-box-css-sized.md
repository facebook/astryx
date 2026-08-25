---
'@astryxdesign/core': minor
---

[breaking] Spinner: the box is sized in CSS, so a consumer's inline `style` width now wins over it (#5214)

The spinner's box used to be sized by an inline `width`/`height` written after the caller's `style`, so a `style={{width}}` on a `<Spinner>` was overwritten and did nothing. Themeable geometry needs the box and the ring to come from the same two custom properties, which means the box is now sized by a CSS rule instead — and a rule loses to an inline style. The precedence flips: a width or height a caller passes through `style` (or through `xstyle`) now applies where it used to be ignored.

Nothing changes for a caller who does not set one, at any size or shade. If you have a `style={{width}}` on a Spinner that was previously inert, it will now resize the box — drop it, or set `--spinner-diameter` and `--spinner-rail-width` through the theme instead, which moves the drawn ring with the box rather than stretching a box around a fixed ring.

@freddymeta
</content>
<parameter name="node_id">85252.od.fbinfra.net
