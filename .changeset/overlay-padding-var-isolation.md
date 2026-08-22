---
'@astryxdesign/core': patch
---

[fix] Stop the container padding system at every overlay boundary. Follow-up to #5209, which zeroed `--container-padding-*` on four overlay roots and closed the visible overflow in #5208 (#5231).

Two gaps remained. The variables descendants ADD (`--layout-padding-*`, and a Section's propagated padding) still crossed the boundary, so an unpadded `Section` inside an overlay took the page's padding instead of the theme default — 40px where 16px was meant. And `Lightbox`, `ContextMenu` and `HoverCard` were never covered.

The reset now lives in one place (`overlayPaddingReset`, exported from `@astryxdesign/core/Layout`) instead of being hand-copied per overlay, and moved onto the `useLayer` root, which covers every layer surface at once. Values descendants subtract are zeroed; values they add are cleared to `initial` so readers fall through to their own default rather than losing their padding.

Section's padding propagation moved from the public `--astryx-section-padding` token to a private `--_section-padding-propagated`. The two carried different authority under one name — a theme's value versus one ancestor's — and an overlay could not drop the inherited one without blanking the theme's. Propagated values still win over the theme for nested sections, so behavior is unchanged. Themes are unaffected: `--astryx-section-padding` remains the public token and still reaches inside overlays.

@imdreamrunner
