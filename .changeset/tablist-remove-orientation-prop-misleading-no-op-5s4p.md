---
'@astryxdesign/core': minor
---

[breaking] TabList: remove orientation prop (misleading no-op). The prop did not render vertical tabs; it only toggled the keyboard-hint badge arrows. Arrow navigation has always accepted both axes (horizontal and vertical) via orientation: both in useListFocus. Run astryx upgrade to auto-strip the prop from your code.
@HelloOjasMutreja
