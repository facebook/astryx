---
'@astryxdesign/core': patch
---

[fix] Card: the `default` variant's border is now drawn with an inset box-shadow instead of a real CSS border. This removes the faint 1px ring that appeared on hover for interactive cards (ClickableCard) using non-`default` variants, and keeps identical geometry across variants with no layout jitter.
@kentonquatman
