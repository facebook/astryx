---
'@astryxdesign/core': patch
---

[fix] Table sticky columns: the pinned-column shadow now reads the theme's `--color-shadow` token instead of a hardcoded `light-dark()` tint, so a theme can retint it.

The tint was `light-dark(rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.32))` written in the component, chosen because `--color-shadow` (10%/30% alpha) read as slightly too faint. A literal in a component is the one place a theme cannot reach: every theme got this exact black regardless of its own shadow colour, and the two-point alpha difference bought nothing for it — rendered, the token version differs by at most 5/255 on any channel in light mode and 1/255 in dark, over the ~0.4% of the frame the two shadow strips occupy.

Reading the token instead means the seven bundled themes each tint this shadow with the value they already declare for every other shadow (`chocolate` `#4a35201A`, `stone` `#25252a1a`, and so on), and a custom theme gets the same reach.

@cixzhang
