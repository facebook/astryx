---
'@astryxdesign/core': patch
---

[fix] ChatLayoutScrollButton: the default (label-less) state now renders as icon-only, with the translated "Scroll to bottom" string as the accessible name only. It was previously missing `isIconOnly` on its inner `Button`, so Button's default (visible-text) contract rendered the translation as clipped visible text inside the circular button instead.

@HelloOjasMutreja
