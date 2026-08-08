---
'@astryxdesign/core': patch
---

[fix] Banner: the default status icon now inherits its color from the 'banner-icon' wrapper instead of hard-coding an Icon color variant (info rendered Icon color="accent"). Theme component overrides on 'astryx-banner-icon' with 'status:X' that set color now reach the glyph. Default rendering is unchanged: the wrapper carries the same status tokens the icon used before (info still resolves to --color-accent), and themes that re-scope those tokens on the banner root keep working (#4166)

@jiunshinn
