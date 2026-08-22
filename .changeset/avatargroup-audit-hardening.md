---
'@astryxdesign/core': patch
---

[fix] AvatarGroup: four defects out of the component audit, three of them in `AvatarGroupOverflow` (#5055).

The indicator was `display: flex` on a span, which is a block-level flex container, so the exported component rendered as a full-width bar instead of a circle anywhere outside an `AvatarGroup`: measured 1168px wide in a 1168px parent. It is `inline-flex` now; inside a group nothing changes, because a flex item is blockified either way.

Its label font size was a bare `size * 0.35`, which computes 7px at `xsm` and 8.4px at `sm`. That is under the 12px legibility floor, and the effect is worse than the number suggests: the glyph stroke ends up thinner than a pixel, so it never reaches its own text colour. Decoded from a screenshot, the darkest pixel at `xsm` is `#bebebe` on a `#f0f0f0` field, a contrast of 1.63:1 where 4.5:1 is required. The size now floors at the `--text-supporting-size` role token and scales proportionally above it, so `md` and larger are unchanged.

The indicator also kept its negative overlap margin when it was the first child of a group, hanging 12px outside the group's own box. It now carries the same `:not(:first-child)` guard `Avatar` already had. And a negative `count` rendered the string `+-3` and announced "-3 more"; since the documented shape for the prop is `total - visibleCount`, which goes negative whenever the list is shorter than the slice, it now clamps at zero.

Docs: the guidance told readers to "set max to limit visible avatars", and there is no `max` prop. The API is compositional on purpose, so the consumer slices; the guidance now says that. The keyboard behaviour names the APG roving tabindex technique it implements, and `size` now says that the group's value wins over each child avatar's own `size`, including when the group leaves it at the default.

@cixzhang
