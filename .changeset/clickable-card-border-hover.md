---
'@astryxdesign/core': patch
---

[fix] ClickableCard: remove the faint hover "ring" on borderless variants (everything except `default`) by dropping their invisible border. The `default` variant now draws its border inside the padding so outer dimensions stay identical across variants, and its border color emphasizes on hover. (#3712)
@kentonquatman
