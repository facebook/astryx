---
'@astryxdesign/core': patch
---

[fix] Thumbnail: replace the hover box-shadow on interactive tiles with the same `::after` overlay treatment ClickableCard and SelectableCard use. All three now tint on hover with `--color-overlay-hover` (and `--color-overlay-pressed` on press), so interactive feedback is consistent across the card family.

@kentonquatman
