---
'@astryxdesign/core': patch
---

[fix] Make text-only Bottom Sheets keyboard-scrollable: the scroll body becomes a Tab stop only while it actually overflows and contains no visible sequentially focusable control, so short sheets never gain a dead stop and sheets whose only controls are CSS-hidden or tabindex="-1" keep one (#5207)

@jiunshinn
