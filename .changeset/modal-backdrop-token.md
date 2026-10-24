---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
'@astryxdesign/theme-butter': patch
'@astryxdesign/theme-chocolate': patch
'@astryxdesign/theme-gothic': patch
'@astryxdesign/theme-matcha': patch
'@astryxdesign/theme-neutral': patch
'@astryxdesign/theme-stone': patch
'@astryxdesign/theme-y2k': patch
---

[feat] New `--color-background-backdrop` token: the dim behind a modal. Dialog (and so AlertDialog), Drawer, MobileNav and BottomSheet paint their `::backdrop` with it, and the dim no longer blurs the page behind it. With the base tokens it is the iOS dimming colour: black at 20 % in light mode and 48 % in dark mode, in place of a blue-grey at 40 % (light) or 60 % (dark) with a 2 px blur. Each bundled theme sets the token to the overlay colour it already dimmed with, so a themed app's dim keeps its colour and only loses the blur. `--color-overlay` stays the scrim that keeps text and icons legible over media (Overlay, Thumbnail). `astryx docs tokens/tokens-color`, the Tailwind bridge (`bg-backdrop`) and the theme template list the new token.

@vjeux
